# Medicore — fresh Flask project

Medicore is a prescription request and pharmacy communication portal. Customers can register, submit medicine requests, view status, and chat about their requests. Pharmacists have a separate queue, can reply in real time, and can mark requests Available or Unavailable.

## Included features

- Customer registration and login with hashed passwords
- Separate customer and pharmacist workspaces
- Prescription request creation, history, details, and deletion
- Live Socket.IO chat for each request
- Pharmacist-only status updates
- Access checks for customer-owned requests
- SQLite database created automatically at first run
- Responsive Bootstrap-based UI

## Requirements

Python 3.10 or newer is recommended.

## Windows PowerShell setup

Open PowerShell in this folder and run:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python -m py_compile app.py
python app.py
```

If PowerShell blocks virtual-environment activation, open Command Prompt and use:

```bat
py -m venv .venv
.venv\Scripts\activate.bat
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python app.py
```

## Linux / macOS setup

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python -m py_compile app.py
python app.py
```

Then open http://127.0.0.1:5000 in your browser.

## Create a pharmacist account

Public registration creates customer accounts only. With the virtual environment active and from the project root, run:

```bash
python create_pharmacist.py
```

Enter a username and password when prompted. Then log in using that account in a separate browser or private window to test the pharmacist workflow.

## Fresh database

The app creates `database.db` in this project directory automatically. Since this is a new project folder, it will be a separate database from any older Medicore project. Do not copy the old database into this folder if you want a completely clean start.

To intentionally reset this new project's local data, stop the server and delete `database.db`. This permanently deletes the local accounts, requests, and messages.

## Notes

- The development secret key fallback is for local testing only. Set `MEDICORE_SECRET_KEY` to a strong random secret before deployment.
- Bootstrap, the Google font, and Socket.IO browser client are loaded from CDNs, so the browser needs internet access for those assets.
- This is a development starter, not a production-ready medical records system. Add CSRF protection, deployment-grade secrets, HTTPS, appropriate privacy controls, and a proper review of applicable healthcare/data protection obligations before real patient use.
