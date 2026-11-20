import os
from functools import wraps
from pathlib import Path

from flask import Flask, render_template, request, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO, join_room, emit
from flask_login import (
    LoginManager, UserMixin, login_user, logout_user,
    login_required, current_user
)
from werkzeug.security import generate_password_hash, check_password_hash


BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = BASE_DIR / "database.db"

app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get(
    "MEDICORE_SECRET_KEY", "local-development-key-change-before-deployment"
)
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{DATABASE_PATH.as_posix()}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["MAX_CONTENT_LENGTH"] = 2 * 1024 * 1024

db = SQLAlchemy(app)
socketio = SocketIO(app, async_mode="threading")
login_manager = LoginManager(app)
login_manager.login_view = "login"
login_manager.login_message = "Please log in to continue."
login_manager.login_message_category = "info"

VALID_STATUSES = {"Pending", "Awaiting Reply", "Available", "Unavailable"}


# -------------------------------------------------------------------
# DATABASE MODELS
# -------------------------------------------------------------------
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="customer")

    requests = db.relationship(
        "PrescriptionRequest",
        backref="customer",
        lazy=True,
        cascade="all, delete-orphan",
    )

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return bool(self.password_hash) and check_password_hash(
            self.password_hash, password
        )


class PrescriptionRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(
        db.Integer, db.ForeignKey("user.id"), nullable=False, index=True
    )
    medicines_text = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(50), nullable=False, default="Pending")
    timestamp = db.Column(db.DateTime, nullable=False, server_default=db.func.now())

    messages = db.relationship(
        "ChatMessage",
        backref="prescription_request",
        lazy=True,
        cascade="all, delete-orphan",
        order_by="ChatMessage.timestamp",
    )


class ChatMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    request_id = db.Column(
        db.Integer, db.ForeignKey("prescription_request.id"), nullable=False, index=True
    )
    sender_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    message_text = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, server_default=db.func.now())

    sender = db.relationship("User", backref="sent_messages")


@login_manager.user_loader
def load_user(user_id):
    try:
        return db.session.get(User, int(user_id))
    except (TypeError, ValueError):
        return None


# -------------------------------------------------------------------
# HELPERS AND ACCESS CONTROL
# -------------------------------------------------------------------
def role_required(role):
    def decorator(view_function):
        @wraps(view_function)
        @login_required
        def wrapped(*args, **kwargs):
            if current_user.role != role:
                flash("You are not authorized to access that page.", "danger")
                return redirect(url_for("index"))
            return view_function(*args, **kwargs)
        return wrapped
    return decorator


def can_access_request(prescription_request):
    if not current_user.is_authenticated or prescription_request is None:
        return False
    if current_user.role == "pharmacist":
        return True
    return (
        current_user.role == "customer"
        and prescription_request.customer_id == current_user.id
    )


def socket_error(message):
    emit("error_message", {"message": message})


def get_socket_request(data):
    if not current_user.is_authenticated:
        socket_error("Please log in to use this feature.")
        return None

    if not isinstance(data, dict):
        socket_error("Invalid request data.")
        return None

    try:
        request_id = int(data.get("request_id"))
    except (TypeError, ValueError):
        socket_error("Invalid prescription request.")
        return None

    prescription_request = db.session.get(PrescriptionRequest, request_id)
    if not can_access_request(prescription_request):
        socket_error("You cannot access this prescription request.")
        return None
    return prescription_request


# -------------------------------------------------------------------
# REAL-TIME CHAT
# -------------------------------------------------------------------
@socketio.on("join")
def handle_join(data):
    if not current_user.is_authenticated:
        socket_error("Please log in to join the chat.")
        return
    if not isinstance(data, dict):
        socket_error("Invalid chat room.")
        return

    try:
        request_id = int(data.get("room"))
    except (TypeError, ValueError):
        socket_error("Invalid chat room.")
        return

    prescription_request = db.session.get(PrescriptionRequest, request_id)
    if not can_access_request(prescription_request):
        socket_error("You cannot access this chat.")
        return

    join_room(str(request_id))


@socketio.on("send_message")
def handle_send_message(data):
    prescription_request = get_socket_request(data)
    if prescription_request is None:
        return

    message_text = data.get("msg")
    if not isinstance(message_text, str):
        socket_error("Please enter a valid message.")
        return

    message_text = message_text.strip()
    if not message_text:
        socket_error("Message cannot be empty.")
        return
    if len(message_text) > 2000:
        socket_error("Messages must be 2000 characters or fewer.")
        return

    try:
        message = ChatMessage(
            request_id=prescription_request.id,
            sender_id=current_user.id,
            message_text=message_text,
        )
        db.session.add(message)

        if prescription_request.status == "Pending":
            prescription_request.status = "Awaiting Reply"

        db.session.commit()
        db.session.refresh(message)

        payload = {
            "username": current_user.username,
            "msg": message.message_text,
            "timestamp": (
                message.timestamp.strftime("%Y-%m-%d %H:%M")
                if message.timestamp else ""
            ),
        }
        emit("receive_message", payload, room=str(prescription_request.id))
        emit(
            "status_updated",
            {"status": prescription_request.status},
            room=str(prescription_request.id),
        )
    except Exception:
        db.session.rollback()
        app.logger.exception("Failed to save chat message")
        socket_error("Message could not be sent. Please try again.")


@socketio.on("change_status")
def handle_change_status(data):
    if not current_user.is_authenticated:
        socket_error("Please log in to change the request status.")
        return
    if current_user.role != "pharmacist":
        socket_error("Only pharmacists can change request status.")
        return

    prescription_request = get_socket_request(data)
    if prescription_request is None:
        return

    new_status = data.get("status")
    if new_status not in {"Available", "Unavailable"}:
        socket_error("Invalid status selection.")
        return

    try:
        prescription_request.status = new_status
        db.session.commit()
        emit(
            "status_updated",
            {"status": new_status},
            room=str(prescription_request.id),
        )
    except Exception:
        db.session.rollback()
        app.logger.exception("Failed to update prescription status")
        socket_error("Status could not be updated. Please try again.")


# -------------------------------------------------------------------
# AUTHENTICATION
# -------------------------------------------------------------------
@app.route("/")
def index():
    if not current_user.is_authenticated:
        return redirect(url_for("login"))
    if current_user.role == "pharmacist":
        return redirect(url_for("pharmacist_dashboard"))
    return redirect(url_for("customer_dashboard"))


@app.route("/signup", methods=["GET", "POST"])
def signup():
    if current_user.is_authenticated:
        return redirect(url_for("index"))

    if request.method == "POST":
        username = (request.form.get("username") or "").strip()
        password = request.form.get("password") or ""

        if not username or not password:
            flash("Please enter both username and password.", "warning")
            return redirect(url_for("signup"))
        if len(username) > 100:
            flash("Username must be 100 characters or fewer.", "warning")
            return redirect(url_for("signup"))
        if len(password) < 8:
            flash("Password must be at least 8 characters long.", "warning")
            return redirect(url_for("signup"))
        if User.query.filter_by(username=username).first():
            flash("That username is already taken. Please choose another.", "warning")
            return redirect(url_for("signup"))

        user = User(username=username, role="customer")
        user.set_password(password)

        try:
            db.session.add(user)
            db.session.commit()
        except Exception:
            db.session.rollback()
            app.logger.exception("Registration failed")
            flash("Registration failed. Please try again.", "danger")
            return redirect(url_for("signup"))

        flash("Account created successfully. You can now log in.", "success")
        return redirect(url_for("login"))

    return render_template("signup.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for("index"))

    if request.method == "POST":
        username = (request.form.get("username") or "").strip()
        password = request.form.get("password") or ""

        user = User.query.filter_by(username=username).first() if username else None
        if user is None or not user.check_password(password):
            flash("Please check your username and password and try again.", "danger")
            return redirect(url_for("login"))

        login_user(user)
        flash("Welcome back!", "success")
        return redirect(url_for("index"))

    return render_template("login.html")


@app.route("/logout", methods=["GET", "POST"])
@login_required
def logout():
    logout_user()
    flash("You have been logged out.", "info")
    return redirect(url_for("login"))


# -------------------------------------------------------------------
# CUSTOMER
# -------------------------------------------------------------------
@app.route("/customer/dashboard")
@role_required("customer")
def customer_dashboard():
    requests_list = (
        PrescriptionRequest.query
        .filter_by(customer_id=current_user.id)
        .order_by(PrescriptionRequest.timestamp.desc())
        .all()
    )
    return render_template("customer_dashboard.html", requests=requests_list)


@app.route("/customer/new_prescription", methods=["GET", "POST"])
@role_required("customer")
def new_prescription():
    if request.method == "POST":
        medicines_text = (request.form.get("medicines") or "").strip()
        if not medicines_text:
            flash("Please enter the medicine details.", "warning")
            return redirect(url_for("new_prescription"))
        if len(medicines_text) > 10000:
            flash("Medicine details must be 10,000 characters or fewer.", "warning")
            return redirect(url_for("new_prescription"))

        prescription_request = PrescriptionRequest(
            customer_id=current_user.id,
            medicines_text=medicines_text,
            status="Pending",
        )
        try:
            db.session.add(prescription_request)
            db.session.commit()
        except Exception:
            db.session.rollback()
            app.logger.exception("Prescription submission failed")
            flash("Your request could not be submitted. Please try again.", "danger")
            return redirect(url_for("new_prescription"))

        flash("Your prescription request has been submitted.", "success")
        return redirect(url_for("customer_dashboard"))

    return render_template("new_prescription.html")


@app.route("/request/<int:request_id>", methods=["POST"])
@role_required("customer")
def delete_request(request_id):
    prescription_request = db.get_or_404(PrescriptionRequest, request_id)
    if prescription_request.customer_id != current_user.id:
        flash("You are not authorized to delete this request.", "danger")
        return redirect(url_for("customer_dashboard"))

    try:
        db.session.delete(prescription_request)
        db.session.commit()
        flash("Prescription request deleted.", "success")
    except Exception:
        db.session.rollback()
        app.logger.exception("Prescription deletion failed")
        flash("Could not delete this request. Please try again.", "danger")

    return redirect(url_for("customer_dashboard"))


# -------------------------------------------------------------------
# PHARMACIST
# -------------------------------------------------------------------
@app.route("/pharmacist/dashboard")
@role_required("pharmacist")
def pharmacist_dashboard():
    requests_list = (
        PrescriptionRequest.query
        .filter(PrescriptionRequest.status.in_(["Pending", "Awaiting Reply"]))
        .order_by(PrescriptionRequest.timestamp.asc())
        .all()
    )
    return render_template("pharmacist_dashboard.html", requests=requests_list)


# -------------------------------------------------------------------
# SHARED REQUEST DETAILS
# -------------------------------------------------------------------
@app.route("/request/<int:request_id>", methods=["GET"])
@login_required
def request_details(request_id):
    prescription_request = db.get_or_404(PrescriptionRequest, request_id)
    if not can_access_request(prescription_request):
        flash("You are not authorized to view this request.", "danger")
        return redirect(url_for("index"))

    customer = db.session.get(User, prescription_request.customer_id)
    chat_history = (
        ChatMessage.query
        .filter_by(request_id=request_id)
        .order_by(ChatMessage.timestamp.asc(), ChatMessage.id.asc())
        .all()
    )
    return render_template(
        "request_details.html",
        req=prescription_request,
        customer=customer,
        chat_history=chat_history,
    )


# -------------------------------------------------------------------
# STARTUP
# -------------------------------------------------------------------
with app.app_context():
    db.create_all()


if __name__ == "__main__":
    debug_enabled = os.environ.get("FLASK_DEBUG", "true").lower() in {
        "1", "true", "yes"
    }
    socketio.run(app, debug=debug_enabled)
