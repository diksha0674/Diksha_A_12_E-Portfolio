"""Create a pharmacist account in the local Medicore database."""
from getpass import getpass

from app import app, db, User


def main():
    with app.app_context():
        username = input("Choose pharmacist username: ").strip()
        if not username:
            print("Username cannot be empty.")
            return
        if len(username) > 100:
            print("Username must be 100 characters or fewer.")
            return
        if User.query.filter_by(username=username).first():
            print("That username already exists.")
            return

        password = getpass("Choose password (at least 8 characters): ")
        confirm = getpass("Confirm password: ")
        if len(password) < 8:
            print("Password must be at least 8 characters.")
            return
        if password != confirm:
            print("Passwords do not match.")
            return

        user = User(username=username, role="pharmacist")
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        print(f"Pharmacist account '{username}' created successfully.")


if __name__ == "__main__":
    main()
