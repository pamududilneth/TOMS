import os
import gspread
from google.oauth2.service_account import Credentials
from dotenv import load_dotenv

load_dotenv()

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]

SERVICE_ACCOUNT_FILE = os.getenv("GOOGLE_SERVICE_ACCOUNT_FILE", "google-service-account.json")

_client = None


def _get_client():
    global _client
    if _client is None:
        if not os.path.exists(SERVICE_ACCOUNT_FILE):
            raise RuntimeError(
                f"Google service account file not found at '{SERVICE_ACCOUNT_FILE}'. "
                "Check GOOGLE_SERVICE_ACCOUNT_FILE in toms-backend/.env"
            )
        creds = Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE, scopes=SCOPES)
        _client = gspread.authorize(creds)
    return _client


HEADERS = [
    "Request ID",
    "Vehicle Number",
    "Driver Name",
    "Driver Contact Number",
    "Pickup Location",
    "Delivery Location",
    "Status",
    "Submitted At",
]


def get_or_create_client_sheet(sheet_title: str, client_email: str | None):
    """
    Returns (spreadsheet, share_url). Creates the sheet on first call for this
    title, shares it with the client's email if provided, and returns the
    existing one on later calls (found by exact title match).
    """
    gc = _get_client()

    try:
        sh = gc.open(sheet_title)
        created = False
    except gspread.SpreadsheetNotFound:
        sh = gc.create(sheet_title)
        ws = sh.sheet1
        ws.update("A1", [HEADERS])
        ws.format("A1:H1", {"textFormat": {"bold": True}})
        created = True

    if created and client_email:
        sh.share(client_email, perm_type="user", role="reader", notify=False)

    return sh, sh.url


def append_incident_row(sheet_title: str, row_values: list):
    gc = _get_client()
    sh = gc.open(sheet_title)
    ws = sh.sheet1
    ws.append_row(row_values, value_input_option="USER_ENTERED")