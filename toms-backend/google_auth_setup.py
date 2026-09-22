"""
Run this once to authorize TOMS to use your real Google account for
Sheets/Drive. Opens a browser window — sign in and click Allow. After this
completes, google-oauth-token.json is created and the backend will use it
silently from then on, with no further logins needed.
"""
from app.utils.google_oauth import get_credentials

get_credentials()
print("Google account authorized successfully. You can now start the backend normally.")