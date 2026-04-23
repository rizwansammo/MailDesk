from __future__ import annotations

import json
import re
from collections import deque
from datetime import datetime
from pathlib import Path
from string import Formatter
from typing import Any

from flask import Flask, jsonify, redirect, render_template, request, url_for

app = Flask(__name__)
BASE_DIR = Path(__file__).resolve().parent
CANNED_EMAILS_FILE = BASE_DIR / "data" / "canned_emails.json"

FIELD_DEFINITIONS: dict[str, dict[str, Any]] = {
    "user_name": {
        "label": "User Name",
        "placeholder": "Enter user name",
        "type": "text",
        "required": True,
    },
    "full_name": {
        "label": "Full Name",
        "placeholder": "Enter full name",
        "type": "text",
        "required": True,
    },
    "email": {
        "label": "Email Address",
        "placeholder": "Enter user email",
        "type": "email",
        "required": True,
    },
    "temp_password": {
        "label": "Temporary Password",
        "placeholder": "Enter temporary password",
        "type": "text",
        "required": True,
    },
    "ticket_id": {
        "label": "Ticket ID",
        "placeholder": "Enter ticket/reference ID",
        "type": "text",
        "required": False,
    },
    "notes": {
        "label": "Notes / Additional Info",
        "placeholder": "Add useful context or next steps",
        "type": "textarea",
        "required": False,
    },
    "custom_template_name": {
        "label": "Template Name",
        "placeholder": "e.g., VPN Access Update",
        "type": "text",
        "required": False,
    },
    "custom_subject": {
        "label": "Custom Subject",
        "placeholder": "Enter custom email subject",
        "type": "text",
        "required": True,
    },
    "custom_body": {
        "label": "Custom Body",
        "placeholder": "Write your custom body. You can use placeholders like {full_name}, {email}",
        "type": "textarea",
        "required": True,
    },
}

EMAIL_TEMPLATES: dict[str, dict[str, Any]] = {
    "onboarding": {
        "label": "Onboarding Email",
        "fields": ["full_name", "user_name", "email", "temp_password", "notes"],
        "subject": "Welcome to IT Services - Your Account Is Ready",
        "body": (
            "Hello {full_name},\n\n"
            "Welcome aboard. Your IT account has been created and is now active.\n\n"
            "Username: {user_name}\n"
            "Registered Email: {email}\n"
            "Temporary Password: {temp_password}\n\n"
            "For security, please sign in and update your password immediately.\n"
            "If you need assistance with first-time setup, contact the IT Service Desk.\n\n"
            "Additional Notes:\n{notes}\n\n"
            "Best regards,\n"
            "IT Support Team"
        ),
    },
    "access_granted": {
        "label": "Access Granted",
        "fields": ["full_name", "email", "ticket_id", "notes"],
        "subject": "Access Request Approved",
        "body": (
            "Hello {full_name},\n\n"
            "Your requested access has been granted successfully.\n\n"
            "Email: {email}\n"
            "Reference Ticket: {ticket_id}\n\n"
            "Please verify access and confirm if everything is working as expected.\n"
            "If you encounter any issues, reply to this email and we will assist promptly.\n\n"
            "Additional Notes:\n{notes}\n\n"
            "Best regards,\n"
            "IT Support Team"
        ),
    },
    "follow_up": {
        "label": "Follow-up Reminder",
        "fields": ["full_name", "email", "ticket_id", "notes"],
        "subject": "Follow-up on Your IT Support Request",
        "body": (
            "Hello {full_name},\n\n"
            "This is a friendly follow-up regarding your support request.\n\n"
            "Email: {email}\n"
            "Reference Ticket: {ticket_id}\n\n"
            "If your issue is resolved, please let us know so we can close the ticket.\n"
            "If you still need help, reply with an update and we will continue supporting you.\n\n"
            "Additional Notes:\n{notes}\n\n"
            "Best regards,\n"
            "IT Support Team"
        ),
    },
    "password_reset": {
        "label": "Password Reset",
        "fields": ["full_name", "email", "temp_password", "notes"],
        "subject": "Password Reset Instructions",
        "body": (
            "Hello {full_name},\n\n"
            "Your password has been reset as requested.\n\n"
            "Email: {email}\n"
            "Temporary Password: {temp_password}\n\n"
            "Please sign in and change your password immediately to keep your account secure.\n"
            "If you are unable to sign in, contact the IT Service Desk.\n\n"
            "Additional Notes:\n{notes}\n\n"
            "Best regards,\n"
            "IT Support Team"
        ),
    },
    "custom": {
        "label": "Custom Template",
        "fields": [
            "full_name",
            "email",
            "notes",
            "custom_template_name",
            "custom_subject",
            "custom_body",
        ],
        "subject": "{custom_subject}",
        "body": "{custom_body}",
    },
}

RECENT_HISTORY: deque[dict[str, str]] = deque(maxlen=8)


def load_canned_emails() -> list[dict[str, Any]]:
    if not CANNED_EMAILS_FILE.exists():
        return []

    with CANNED_EMAILS_FILE.open("r", encoding="utf-8") as file_obj:
        payload = json.load(file_obj)

    if isinstance(payload, list):
        return payload
    return []


def save_canned_emails(canned_items: list[dict[str, Any]]) -> None:
    CANNED_EMAILS_FILE.parent.mkdir(parents=True, exist_ok=True)
    with CANNED_EMAILS_FILE.open("w", encoding="utf-8") as file_obj:
        json.dump(canned_items, file_obj, indent=2)


def slugify(value: str) -> str:
    normalized = re.sub(r"[^a-z0-9]+", "-", value.strip().lower())
    return normalized.strip("-")


def ensure_unique_canned_id(title: str, canned_items: list[dict[str, Any]]) -> str:
    base_slug = slugify(title) or "template"
    existing_ids = {str(item.get("id", "")).strip() for item in canned_items}

    candidate = base_slug
    counter = 2
    while candidate in existing_ids:
        candidate = f"{base_slug}-{counter}"
        counter += 1
    return candidate


def standard_template_presets() -> dict[str, dict[str, str]]:
    return {
        key: {
            "label": value["label"],
            "subject": value["subject"],
            "body": value["body"],
        }
        for key, value in EMAIL_TEMPLATES.items()
        if key != "custom"
    }


def canned_email_lookup(canned_items: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    return {
        str(item.get("id", "")).strip(): item
        for item in canned_items
        if str(item.get("id", "")).strip()
    }


def safe_format(template_text: str, values: dict[str, str]) -> str:
    parsed_keys = {
        field_name
        for _, field_name, _, _ in Formatter().parse(template_text)
        if field_name
    }

    default_values = {key: "{" + key + "}" for key in parsed_keys}
    default_values.update(values)
    return template_text.format_map(default_values)


def normalize_payload(payload: dict[str, Any]) -> dict[str, str]:
    normalized: dict[str, str] = {}
    for key, value in payload.items():
        normalized[key] = str(value).strip() if value is not None else ""
    return normalized


@app.get("/")
def index() -> Any:
    return redirect(url_for("generator"))


@app.get("/generator")
def generator() -> str:
    canned_items = load_canned_emails()
    selected_canned_id = request.args.get("canned", "").strip()
    canned_by_id = canned_email_lookup(canned_items)
    selected_canned = canned_by_id.get(selected_canned_id)

    return render_template(
        "generator.html",
        templates=EMAIL_TEMPLATES,
        field_definitions=FIELD_DEFINITIONS,
        canned_emails=canned_items,
        selected_canned=selected_canned,
        current_year=datetime.now().year,
        active_page="generator",
    )


@app.get("/canned-emails")
def canned_emails_page() -> str:
    canned_items = load_canned_emails()
    return render_template(
        "canned_emails.html",
        canned_emails=canned_items,
        standard_templates=standard_template_presets(),
        current_year=datetime.now().year,
        active_page="canned-emails",
    )


@app.post("/generate")
def generate_email() -> Any:
    payload = normalize_payload(request.get_json(silent=True) or {})
    template_key = payload.get("template", "")

    if template_key not in EMAIL_TEMPLATES:
        return jsonify({"error": "Invalid template selected."}), 400

    template_config = EMAIL_TEMPLATES[template_key]
    subject = safe_format(template_config["subject"], payload)
    body = safe_format(template_config["body"], payload)

    generated_email = f"Subject: {subject}\n\n{body}".strip()

    RECENT_HISTORY.appendleft(
        {
            "template": template_config["label"],
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "subject": subject,
        }
    )

    return jsonify(
        {
            "email": generated_email,
            "subject": subject,
            "template": template_config["label"],
            "recent": list(RECENT_HISTORY),
        }
    )


@app.get("/api/canned-emails")
def canned_emails_api() -> Any:
    return jsonify({"items": load_canned_emails()})


@app.get("/api/canned-emails/<canned_id>")
def canned_email_detail_api(canned_id: str) -> Any:
    canned_items = load_canned_emails()
    canned_by_id = canned_email_lookup(canned_items)
    selected = canned_by_id.get(canned_id)
    if not selected:
        return jsonify({"error": "Canned email not found."}), 404
    return jsonify({"item": selected})


@app.post("/api/canned-emails")
def canned_email_create_api() -> Any:
    payload = normalize_payload(request.get_json(silent=True) or {})
    title = payload.get("title", "")
    category = payload.get("category", "General")
    subject = payload.get("subject", "")
    body = payload.get("body", "")
    tags_raw = payload.get("tags", "")

    if not title or not subject or not body:
        return jsonify({"error": "Title, subject, and body are required."}), 400

    if isinstance(tags_raw, str):
        tags = [item.strip() for item in tags_raw.split(",") if item.strip()]
    else:
        tags = []

    canned_items = load_canned_emails()
    new_item = {
        "id": ensure_unique_canned_id(title, canned_items),
        "title": title,
        "category": category or "General",
        "subject": subject,
        "body": body,
        "tags": tags,
    }

    canned_items.insert(0, new_item)
    save_canned_emails(canned_items)
    return jsonify({"item": new_item, "items": canned_items})


@app.delete("/api/canned-emails")
def canned_email_delete_api() -> Any:
    payload = request.get_json(silent=True) or {}
    ids = payload.get("ids", [])
    if not isinstance(ids, list) or not ids:
        return jsonify({"error": "No template ids provided."}), 400

    id_set = {str(item).strip() for item in ids if str(item).strip()}
    if not id_set:
        return jsonify({"error": "No valid template ids provided."}), 400

    canned_items = load_canned_emails()
    filtered = [item for item in canned_items if str(item.get("id", "")) not in id_set]

    deleted_count = len(canned_items) - len(filtered)
    save_canned_emails(filtered)
    return jsonify({"deleted": deleted_count, "items": filtered})


if __name__ == "__main__":
    app.run(debug=True)
