import gspread

from .google_oauth import get_credentials

_client = None


def _get_client():
    global _client
    if _client is None:
        creds = get_credentials()
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
    title, owned by your real Google account (so it uses your real storage
    quota, not a service account's zero-quota Drive). Shares it with the
    client's email if provided, and returns the existing one on later calls.
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
        sh.share(client_email, perm_type="user", role="reader", notify=True)

    return sh, sh.url


def append_incident_row(sheet_title: str, row_values: list):
    gc = _get_client()
    sh = gc.open(sheet_title)
    ws = sh.sheet1
    ws.append_row(row_values, value_input_option="USER_ENTERED")