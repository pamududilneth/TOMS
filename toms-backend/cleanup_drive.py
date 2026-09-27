import os
import gspread
from google.oauth2.service_account import Credentials

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]
SERVICE_ACCOUNT_FILE = "google-service-account.json"

def cleanup():
    print("Connecting to Google Drive...")
    creds = Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    gc = gspread.authorize(creds)
    
    files = gc.list_spreadsheet_files()
    if not files:
        print("No files found. Drive is empty!")
        return

    print(f"Found {len(files)} files. Deleting...")
    for f in files:
        try:
            gc.del_spreadsheet(f['id'])
            print(f"Deleted: {f['name']}")
        except Exception as e:
            print(f"Failed to delete {f['name']}: {e}")
            
    print("Cleanup complete! Your storage quota is restored.")

if __name__ == "__main__":
    cleanup()