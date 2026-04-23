# MailDesk - IT Email Template Generator

MailDesk is a multi-page Flask web application for IT support teams to generate consistent, professional email responses quickly.

It includes:
- A Generator page with dynamic fields and editable preview.
- A Canned Email Library with create, preview, edit, copy, select, and bulk delete workflows.
- Light and dark mode UI.
- Placeholder-aware generation where missing values remain visible as placeholders.

## Why MailDesk

IT support teams often repeat similar communication:
- Onboarding and account setup
- Access granted notifications
- Follow-up reminders
- Password reset communication
- Incident acknowledgements

MailDesk standardizes these messages so agents can move faster while keeping tone and quality consistent.

## Core Features

### 1) Email Generator
- Template selector for standard IT templates.
- Dynamic input fields based on selected template.
- Generate button available without strict field requirements.
- Editable email preview before copy.
- Copy to clipboard.
- Recent generated email history.
- Optional local custom template save and reuse.

### 2) Canned Email Library
- Grid-based canned template catalog.
- Click template card to open modal preview editor.
- Edit preview content in the modal and copy directly.
- Create New canned template from:
  - Blank template
  - Standard base templates (Onboarding, Access Granted, Follow-up, Password Reset)
- Template tags and categories.
- Checkbox selection with bulk Delete Selected.
- Persistent storage in JSON file.

### 3) UI and UX
- Sidebar + topbar multipage layout.
- Responsive design for desktop and laptop sizes.
- Light mode and dark mode toggle.
- Cornered visual style with clean, professional spacing.

## Project Structure

MailDesk/
- app.py
- requirements.txt
- README.md
- data/
  - canned_emails.json
- templates/
  - base.html
  - generator.html
  - canned_emails.html
- static/
  - css/
    - style.css
  - js/
    - main.js
    - generator.js
    - canned_emails.js

## Tech Stack

- Python 3
- Flask
- Bootstrap 5
- Vanilla JavaScript
- JSON file persistence for canned emails

## Requirements

### Software
- Python 3.10 or newer recommended
- Pip package manager
- Modern browser (Chrome, Edge, Firefox)

### Python Dependencies
- Flask

Dependencies are listed in requirements.txt.

## Setup and Run

### Option A: Windows (PowerShell)

1. Open PowerShell in the project folder.
2. Create virtual environment:

python -m venv .venv

3. Activate virtual environment:

.\.venv\Scripts\Activate.ps1

4. Install dependencies:

pip install -r requirements.txt

5. Run the app:

python app.py

6. Open browser:

http://127.0.0.1:5000

### Option B: Linux (Bash)

1. Open terminal in the project folder.
2. Create virtual environment:

python3 -m venv .venv

3. Activate virtual environment:

source .venv/bin/activate

4. Install dependencies:

pip install -r requirements.txt

5. Run the app:

python app.py

6. Open browser:

http://127.0.0.1:5000

## How to Use

### Generator Page
1. Select a template.
2. Fill any fields you need.
3. Click Generate Email.
4. Edit output in the preview editor.
5. Click Copy.

Note:
- If some fields are empty, placeholders such as {full_name} remain in output so you can still identify where values should go.

### Canned Email Library Page
1. Browse templates by card.
2. Click a template card to open Preview modal.
3. Edit and copy from modal.
4. To create a new canned template:
   - Click Create New
   - Choose a base standard template or start blank
   - Add title, category, tags, subject, body
   - Save
5. To delete templates:
   - Tick template checkboxes
   - Click Delete Selected

## Data Persistence

- Canned templates are saved in data/canned_emails.json.
- Local custom templates on Generator page are saved in browser local storage.
- Theme preference is also stored in browser local storage.

## API Endpoints

### Page Routes
- GET / -> redirect to /generator
- GET /generator
- GET /canned-emails

### Generator API
- POST /generate

### Canned Email API
- GET /api/canned-emails
- GET /api/canned-emails/<canned_id>
- POST /api/canned-emails
- DELETE /api/canned-emails

## Troubleshooting

### Port already in use
- If port 5000 is busy, stop the conflicting process or run Flask on another port.

### Virtual environment activation fails on Windows
- If script execution is restricted in PowerShell:

Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

Then activate again.

### Flask import error
- Ensure virtual environment is active and dependencies were installed:

pip install -r requirements.txt

### JSON errors in canned library
- Validate data/canned_emails.json syntax.
- Ensure it remains a valid JSON array.

## Security and Production Notes

Current app is designed as an internal tool starter project.
For production deployment, consider:
- Running with a production WSGI server such as Gunicorn or Waitress.
- Adding authentication and role-based access.
- Moving data persistence from JSON to a database.
- Input validation hardening and logging.

## Future Possible Features

- Placeholder auto-detection and dynamic form field generation from custom template body.
- Rich text email editing and HTML email mode.
- Export to .eml, .txt, and PDF.
- SMTP integration to send directly from app.
- Per-team template folders and approval workflow.
- Template version history and rollback.
- Advanced search, filters, and sorting in library.
- User accounts and permissions.
- Audit logs for create/edit/delete actions.
- Multi-language template support.
- Attachment templates and signature profiles.
- AI-assisted tone refinement and grammar checks.
- REST API auth tokens and external system integration.

## License

Choose and add your preferred license before distributing publicly.

## Contributing

Contributions are welcome.
Typical workflow:
1. Fork repository
2. Create feature branch
3. Commit changes
4. Open pull request with clear description and test notes
