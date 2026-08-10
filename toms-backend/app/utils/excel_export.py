import os
from datetime import datetime
from openpyxl import Workbook, load_workbook

# ---> UPDATED FOR DOCKER DEPLOYMENT
EXCEL_DIR = "/app/data/exports"
EXCEL_PATH = os.path.join(EXCEL_DIR, "incidents.xlsx")

HEADERS = [
    "Request ID",
    "Vehicle Number",
    "Driver Name",
    "Driver Contact Number",
    "Assigned Coordinator",
    "Coordinator Mobile Number",
    "Current Parking Location",
    "Parked Time",
    "Pickup Location",
    "Via Location(s)",
    "Delivery Location",
    "Driver Contacted",
    "Driver Feedback",
    "Vehicle Parked",
    "Approver",
    "Client Name",
    "Status",
    "Submitted At",
]


def _ensure_workbook():
    os.makedirs(EXCEL_DIR, exist_ok=True)
    if not os.path.exists(EXCEL_PATH):
        wb = Workbook()
        ws = wb.active
        ws.title = "Incidents"
        ws.append(HEADERS)
        wb.save(EXCEL_PATH)


def append_incident_row(incident):
    _ensure_workbook()

    try:
        wb = load_workbook(EXCEL_PATH)
        ws = wb["Incidents"]

        ws.append([
            incident.request_id,
            incident.vehicle_number,
            incident.driver_name,
            incident.driver_contact_number,
            incident.assigned_coordinator,
            incident.coordinator_mobile_number,
            incident.current_parking_location,
            incident.parked_time,
            incident.pickup_location,
            incident.via_locations,
            incident.delivery_location,
            incident.driver_contacted,
            incident.driver_feedback,
            incident.vehicle_parked,
            incident.approver,
            incident.client_name,
            incident.status,
            incident.created_at.strftime("%Y-%m-%d %H:%M:%S")
            if incident.created_at else datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        ])

        wb.save(EXCEL_PATH)

    except PermissionError as exc:
        raise RuntimeError(
            "Could not write to incidents.xlsx — close the file in Excel and try again."
        ) from exc