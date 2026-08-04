import re
from datetime import datetime

from .email_sender import send_report_link_email
from .google_sheets_client import get_or_create_client_sheet, append_incident_row


def _sheet_title(client_name: str) -> str:
    cleaned = re.sub(r"[^A-Za-z0-9_\- ]", "", client_name).strip()
    return f"TOMS Incidents — {cleaned or 'Client'}"


def share_incident_with_client(client, incident, db):
    """
    Appends the incident to this client's Google Sheet every time.
    Emails the link only the first time this client is ever shared with,
    tracked via client.first_shared_at.
    """
    title = _sheet_title(client.name)

    sh, share_url = get_or_create_client_sheet(title, client.email)

    append_incident_row(title, [
        incident.request_id,
        incident.vehicle_number,
        incident.driver_name,
        incident.driver_contact_number,
        incident.pickup_location,
        incident.delivery_location,
        incident.status,
        incident.created_at.strftime("%Y-%m-%d %H:%M:%S")
        if incident.created_at else datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    ])

    if client.first_shared_at is None:
        client.share_link = share_url

        if client.email:
            send_report_link_email(
                to_email=client.email,
                client_name=client.name,
                share_link=share_url,
            )

        client.first_shared_at = datetime.now()
        db.add(client)
        db.commit()