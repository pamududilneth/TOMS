import gspread
from .google_oauth import get_credentials

_client = None

def _get_client():
    global _client
    if _client is None:
        creds = get_credentials()
        _client = gspread.authorize(creds)
    return _client

# ==========================================
# 1. INCIDENTS LOGIC (Your Working Code)
# ==========================================
INCIDENT_HEADERS = [
    "Key",
    "User",
    "Reported Date by the Call Centre",
    "Reported Time by the Call Centre",
    "Customer",
    "Vehicle Stop Category",
    "Job No",
    "Vehicle No",
    "Driver Name",
    "Driver Contact No",
    "Vehicle Assigned by (Coordinator Name)",
    "Coordinator Mobile No",
    "Driver Contacted by OKI DOKI",
    "Driver Feedback - If Contacted",
    "Vehicle Parking with Goods",
    "Vehicle Stopped Location",
    "Vehicle Stopped Date",
    "Vehicle Stopped Time",
    "Vehicle Stopped Date & Time - V2",
    "Pickup Location",
    "Via Location/s",
    "Delivery Location",
    "Duration",
]

def get_or_create_client_sheet(sheet_title: str, client_email: str | None):
    gc = _get_client()

    try:
        sh = gc.open(sheet_title)
        created = False
    except gspread.SpreadsheetNotFound:
        sh = gc.create(sheet_title)
        ws = sh.sheet1
        ws.update("A1", [INCIDENT_HEADERS])
        # ---> UPDATED: Changed from A1:O1 to A1:W1 to accommodate all 23 columns
        ws.format("A1:W1", {"textFormat": {"bold": True}})
        created = True

    if created and client_email:
        # Kept notify=True to prevent the Okidoki custom email error!
        sh.share(client_email, perm_type="user", role="reader", notify=True)

    return sh, sh.url

def append_incident_row(sheet_title: str, row_values: list):
    gc = _get_client()
    sh = gc.open(sheet_title)
    ws = sh.sheet1
    ws.append_row(row_values, value_input_option="USER_ENTERED")


# ==========================================
# 2. MASTER SHEETS (New Code)
# ==========================================

# ---> UPDATED: 45-column Breakdown Headers
BREAKDOWN_HEADERS = [
    "Record ID", "Data Entered by", "Incident Date/Time", "Incident Month",
    "Reported Date/Time to the Compliance Team", "Reported Month", "Time for Reporting",
    "Job No", "Incident Reference No by Compliance Team", "Customer", "Vehicle No",
    "Driver", "Supplier", "Category", "Category Detail", "Injury Category", "Route Cause",
    "Shipment Content (Goods)", "Third Party Life", "Driver/Assistant Life", "Vehicle",
    "Third Party Property", "Delivery on Time", "Combined Result", "Severity Level",
    "Severity Classification", "Involvement of Police", "Legal Impact", "Customer Claim",
    "Other Cost", "Financial Impact", "Action", "Action Taken Date", "Remark", "Status",
    "Action Closing Date", "Time for Action Closing", "Applicability of Correction",
    "Correction", "Applicability of Corrective Action", "Corrective Action",
    "Responsible Person for Corrective Action", "Target Date for Corrective Action",
    "Target Month for Corrective Action", "Status for Corrective Action",
]

STOP_MANAGEMENT_HEADERS = [
    "ID", "Vehicle Number", "Driver Name", "Stop Reason", "Duration", "Location", "Reported At"
]

def get_or_create_master_sheet(sheet_title: str, headers: list):
    """Finds the master sheet, or creates it with bold headers if it doesn't exist."""
    gc = _get_client()
    try:
        sh = gc.open(sheet_title)
    except gspread.SpreadsheetNotFound:
        sh = gc.create(sheet_title)
        ws = sh.sheet1
        ws.update("A1", [headers])

        # Automatically determine the end column letter based on length of headers
        # Note: chr(64 + len) only works up to 26 (column Z).
        # We handle up to 45 columns here with a simple A-Z, AA-AZ builder.
        col_count = len(headers)
        if col_count <= 26:
            end_col_letter = chr(64 + col_count)
        else:
            first_letter = chr(64 + (col_count // 26))
            second_letter = chr(64 + (col_count % 26))
            if second_letter == '@': # Handle exact multiples of 26
                first_letter = chr(64 + (col_count // 26) - 1)
                second_letter = 'Z'
            end_col_letter = f"{first_letter}{second_letter}"

        ws.format(f"A1:{end_col_letter}1", {"textFormat": {"bold": True}})

    return sh

def append_breakdown_row(row_values: list):
    """Appends a new breakdown to the master Google Sheet."""
    sheet_name = "TOMS - Vehicle Breakdowns Master"
    sh = get_or_create_master_sheet(sheet_name, BREAKDOWN_HEADERS)
    ws = sh.sheet1
    ws.append_row(row_values, value_input_option="USER_ENTERED")

def append_stop_management_row(row_values: list):
    """Appends a new stop record to the master Google Sheet."""
    sheet_name = "TOMS - Stop Management Master"
    sh = get_or_create_master_sheet(sheet_name, STOP_MANAGEMENT_HEADERS)
    ws = sh.sheet1
    ws.append_row(row_values, value_input_option="USER_ENTERED")


def append_master_incident_row(row_values: list):
    """Appends a new incident to the centralized Master Google Sheet."""
    sheet_name = "TOMS - Incidents Master"
    sh = get_or_create_master_sheet(sheet_name, INCIDENT_HEADERS)
    ws = sh.sheet1
    ws.append_row(row_values, value_input_option="USER_ENTERED")


def delete_row_by_value(sheet_title: str, match_value: str, column: int = 1) -> bool:
    """
    Finds a cell in the given column matching match_value exactly, and
    deletes that entire row. Returns True if found and deleted, False if
    the sheet doesn't exist or no matching row was found. Never raises —
    a missing sheet/row shouldn't block the actual database deletion.
    """
    gc = _get_client()

    try:
        sh = gc.open(sheet_title)
    except gspread.SpreadsheetNotFound:
        return False

    ws = sh.sheet1

    try:
        cell = ws.find(str(match_value), in_column=column)
    except gspread.exceptions.CellNotFound:
        cell = None

    if cell is None:
        return False

    ws.delete_rows(cell.row)
    return True


def delete_master_incident_row(request_id: str) -> bool:
    """Deletes the matching row from the centralized Incidents Master sheet."""
    return delete_row_by_value("TOMS - Incidents Master", request_id, column=1)


def delete_breakdown_row(job_number: str) -> bool:
    """Deletes the matching row from the Vehicle Breakdowns Master sheet."""
    return delete_row_by_value("TOMS - Vehicle Breakdowns Master", job_number, column=1)


def set_row_height(sheet_title: str, row_number: int, height_px: int = 230):
    gc = _get_client()
    try:
        sh = gc.open(sheet_title)
    except gspread.SpreadsheetNotFound:
        return

    ws = sh.sheet1
    sheet_id = ws.id

    body = {
        "requests": [
            {
                "updateDimensionProperties": {
                    "range": {
                        "sheetId": sheet_id,
                        "dimension": "ROWS",
                        "startIndex": row_number - 1,
                        "endIndex": row_number,
                    },
                    "properties": {"pixelSize": height_px},
                    "fields": "pixelSize",
                }
            }
        ]
    }
    sh.batch_update(body)

def set_column_width(sheet_title: str, column_index: int, width_px: int = 320):
    """
    Sets a specific column's width in pixels (1-based index).
    Needed alongside set_row_height so a custom-size IMAGE() isn't
    visually clipped by a narrow default column.
    """
    gc = _get_client()
    try:
        sh = gc.open(sheet_title)
    except gspread.SpreadsheetNotFound:
        return

    ws = sh.sheet1
    sheet_id = ws.id

    body = {
        "requests": [
            {
                "updateDimensionProperties": {
                    "range": {
                        "sheetId": sheet_id,
                        "dimension": "COLUMNS",
                        "startIndex": column_index - 1,
                        "endIndex": column_index,
                    },
                    "properties": {"pixelSize": width_px},
                    "fields": "pixelSize",
                }
            }
        ]
    }
    sh.batch_update(body)