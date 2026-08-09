import re
from datetime import datetime

from .email_sender import send_report_link_email
from .google_sheets_client import get_or_create_client_sheet, append_incident_row
from .google_sheets_client import delete_row_by_value


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
        incident.assigned_coordinator,
        incident.coordinator_mobile_number,
        incident.driver_contacted,
        incident.driver_feedback,
        "Yes" if incident.vehicle_parked else "No",
        incident.current_parking_location,
        incident.parked_time,
        incident.pickup_location,
        incident.via_locations,
        incident.delivery_location,
        incident.approver,
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


def remove_incident_from_client_sheet(client_name: str, request_id: str) -> bool:
    """
    Deletes the matching row from this client's personal Google Sheet, if
    the sheet and row exist. Safe to call even if the client was never
    shared with — returns False rather than raising.
    """
    title = _sheet_title(client_name)
    try:
        return delete_row_by_value(title, request_id, column=1)
    except Exception:
        return False