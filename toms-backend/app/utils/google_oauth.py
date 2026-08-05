import os
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from dotenv import load_dotenv

load_dotenv()

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]

CLIENT_SECRETS_FILE = os.getenv("GOOGLE_OAUTH_CLIENT_SECRETS_FILE", "google-oauth-client.json")
TOKEN_FILE = os.getenv("GOOGLE_OAUTH_TOKEN_FILE", "google-oauth-token.json")


def get_credentials() -> Credentials:
    creds = None

    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)

    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
        with open(TOKEN_FILE, "w") as f:
            f.write(creds.to_json())

    if not creds or not creds.valid:
        if not os.path.exists(CLIENT_SECRETS_FILE):
            raise RuntimeError(
                f"'{CLIENT_SECRETS_FILE}' not found. Run google_auth_setup.py first, "
                "or check GOOGLE_OAUTH_CLIENT_SECRETS_FILE in .env"
            )
        flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRETS_FILE, SCOPES)
        creds = flow.run_local_server(port=0)
        with open(TOKEN_FILE, "w") as f:
            f.write(creds.to_json())

    return creds