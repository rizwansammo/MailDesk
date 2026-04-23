# MailDesk - IT Email Template Generator

MailDesk is a polished Flask web app for IT support teams to generate consistent, professional emails in seconds.

It combines a fast generator workflow with a customizable canned-template library.

## Table of Contents

- [Overview](#overview)
- [Live Feature Highlights](#live-feature-highlights)
- [Project Structure](#project-structure)
- [Requirements](#requirements)
- [How to Clone the Repository](#how-to-clone-the-repository)
- [Setup and Run on Windows](#setup-and-run-on-windows)
- [Setup and Run on Linux](#setup-and-run-on-linux)
- [How to Use the App](#how-to-use-the-app)
- [API Endpoints](#api-endpoints)
- [Troubleshooting](#troubleshooting)
- [Future Possible Features](#future-possible-features)
- [Contributing](#contributing)
- [License](#license)

## Overview

IT support teams repeat similar communication daily:
- Onboarding instructions
- Access granted confirmation
- Password reset updates
- Follow-up reminders
- Incident acknowledgement

MailDesk helps standardize those responses while keeping messages editable and human.

## Live Feature Highlights

### Generator Page
- Dynamic fields based on selected template
- Editable email preview before copying
- Works even if only some fields are filled
- Empty values remain visible as placeholders like `{full_name}`
- Copy-to-clipboard support
- Recent generation history

### Canned Email Library
- Browse canned templates in a clean card view
- Click a card to open preview modal
- Edit and copy directly inside modal
- Create new canned templates from standard base templates
- Select multiple templates and delete in bulk
- Persistent JSON storage

### UI / UX
- Modern sidebar + topbar multipage layout
- Light and dark mode support
- Responsive design for laptop and desktop

## Project Structure

```text
MailDesk/
|-- app.py
|-- requirements.txt
|-- README.md
|-- data/
|   |-- canned_emails.json
|-- templates/
|   |-- base.html
|   |-- generator.html
|   |-- canned_emails.html
|-- static/
|   |-- css/
|   |   |-- style.css
|   |-- js/
|   |   |-- main.js
|   |   |-- generator.js
|   |   |-- canned_emails.js
```

## Requirements

- Python 3.10+
- Pip
- A modern browser (Chrome, Edge, Firefox)

Python dependencies are defined in `requirements.txt`.

## How to Clone the Repository

First-time setup? Start here 👇

Repository URL:
`https://github.com/rizwansammo/MailDesk`

### Clone command

**`git clone https://github.com/rizwansammo/MailDesk.git`**

Then move into the project folder:

**`cd MailDesk`**

## Setup and Run on Windows

Windows quick path 🪟

### 1) Create virtual environment

```powershell
python -m venv .venv
```

### 2) Activate virtual environment

```powershell
.\.venv\Scripts\Activate.ps1
```

If PowerShell blocks script execution:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

Then run activation again.

### 3) Install dependencies

```powershell
pip install -r requirements.txt
```

### 4) Start the app

```powershell
python app.py
```

### 5) Open in browser

```text
http://127.0.0.1:5000
```

## Setup and Run on Linux

Linux quick path 🐧

### 1) Create virtual environment

```bash
python3 -m venv .venv
```

### 2) Activate virtual environment

```bash
source .venv/bin/activate
```

### 3) Install dependencies

```bash
pip install -r requirements.txt
```

### 4) Start the app

```bash
python app.py
```

### 5) Open in browser

```text
http://127.0.0.1:5000
```

## How to Use the App

Daily usage flow 🚀

### Generator Workflow

1. Open **Email Generator**.
2. Select a template.
3. Fill any fields you want.
4. Click **Generate Email**.
5. Edit the preview if needed.
6. Click **Copy**.

Tip: If a value is not provided, placeholder text remains visible, for example `{email}`.

### Library Workflow

1. Open **Canned Email Library**.
2. Click any email card to open the preview modal.
3. Edit and copy from modal.
4. Click **Create New** to build a new canned template.
5. Use checkboxes + **Delete Selected** for bulk removal.

## API Endpoints

### Pages
- `GET /` -> redirects to `/generator`
- `GET /generator`
- `GET /canned-emails`

### Generator API
- `POST /generate`

### Canned Email API
- `GET /api/canned-emails`
- `GET /api/canned-emails/<canned_id>`
- `POST /api/canned-emails`
- `DELETE /api/canned-emails`

## Troubleshooting

### App does not start
- Confirm Python version: `python --version`
- Confirm dependency install: `pip install -r requirements.txt`

### Port 5000 is already in use
- Stop the process using port 5000 or run Flask on another port.

### Library data not saving
- Ensure `data/canned_emails.json` is valid JSON and writable.

## Future Possible Features

- Auto-create dynamic form fields from custom placeholders
- Role-based authentication and template permissions
- Database storage (SQLite/PostgreSQL)
- Template version history and rollback
- Search/filter/sort enhancements in library
- Export to `.eml`, `.txt`, `.pdf`
- Direct SMTP send from app
- Multi-language template support
- AI-assisted tone and grammar refinement
- Docker support for one-command local startup

## Contributing

Contributions are welcome.

Suggested workflow:
1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Open a pull request with test notes

## License

Add your preferred license file before public distribution.

---

Built for IT Support Efficiency.
