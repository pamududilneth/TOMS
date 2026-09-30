import os
from datetime import datetime, timezone, timedelta
from .graph_excel_client import append_row as graph_append_row

INCIDENTS_FILE_PATH = os.getenv("SHAREPOINT_INCIDENTS_FILE_PATH", "/Shared Documents/Unplanned Stop.xlsx")
INCIDENTS_TABLE_NAME = "IncidentsTable"

HEADERS = [
    "Key", "User", "Reported Date/Time by the Call Centre", "Customer",
    "Vehicle Stop Category", "Job No", "Vehicle No", "Driver Name",
    "Driver Contact No", "Vehicle Assigned by (Coordinator Name)",
    "Coordinator Mobile No", "Driver Contacted by OKI DOKI",
    "Driver Feedback - If Contacted", "Vehicle Parking with Goods",
    "Vehicle Stopped Location", "Vehicle Stopped Date & Time",
    "Pickup Location", "Via Location/s", "Delivery Location", "Duration",
]

LOCAL_TZ_OFFSET = timedelta(hours=5, minutes=30)


def _to_local(dt):
    if dt is None:
        return datetime.now()
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone(LOCAL_TZ_OFFSET))


def _combined_stopped_datetime(date_str, time_str):
    if not date_str or not time_str:
        return ""
    try:
        d = datetime.strptime(date_str, "%Y-%m-%d")
        return f"{d.strftime('%d-%m-%Y')} {time_str}:00"
    except ValueError:
        return f"{date_str} {time_str}"


def append_incident_row(incident, username: str, customer_name: str = "", duration: str = ""):
    reported_at = _to_local(incident.created_at)
    reported_datetime_str = f"{reported_at.strftime('%d-%m-%Y')} {reported_at.strftime('%H:%M:%S')}"

    row_values = [
        incident.request_id, username, reported_datetime_str, customer_name,
        incident.stop_category, incident.job_no, incident.vehicle_number,
        incident.driver_name, incident.driver_contact_number, incident.assigned_coordinator,
        incident.coordinator_mobile_number, incident.driver_contacted, incident.driver_feedback,
        "Yes" if incident.vehicle_parked else "No", incident.current_parking_location,
        _combined_stopped_datetime(incident.stopped_date, incident.stopped_time),
        incident.pickup_location, incident.via_locations, incident.delivery_location, duration,
    ]

    graph_append_row(INCIDENTS_FILE_PATH, INCIDENTS_TABLE_NAME, HEADERS, row_values)