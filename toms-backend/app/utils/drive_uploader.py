import os
import mimetypes
import time
import traceback
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

from .google_oauth import get_credentials

_drive_service = None
_folder_id_cache = None

FOLDER_NAME = "TOMS Breakdown Photos"


def _get_drive_service():
    global _drive_service
    if _drive_service is None:
        creds = get_credentials()
        _drive_service = build("drive", "v3", credentials=creds)
    return _drive_service


def _get_or_create_folder() -> str:
    """Finds (or creates) a dedicated folder so uploads don't clutter My Drive."""
    global _folder_id_cache
    if _folder_id_cache:
        return _folder_id_cache

    service = _get_drive_service()

    results = service.files().list(
        q=f"name='{FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false",
        fields="files(id, name)",
    ).execute()

    files = results.get("files", [])
    if files:
        _folder_id_cache = files[0]["id"]
        return _folder_id_cache

    folder_metadata = {
        "name": FOLDER_NAME,
        "mimeType": "application/vnd.google-apps.folder",
    }
    folder = service.files().create(body=folder_metadata, fields="id").execute()
    _folder_id_cache = folder["id"]
    return _folder_id_cache


def upload_image_and_get_public_url(
    local_path: str, filename: str, max_attempts: int = 3
) -> str | None:
    if not os.path.exists(local_path):
        print(f"[drive_uploader] File does not exist: {local_path}")
        return None

    last_error = None

    for attempt in range(1, max_attempts + 1):
        try:
            service = _get_drive_service()
            folder_id = _get_or_create_folder()

            mime_type, _ = mimetypes.guess_type(local_path)
            mime_type = mime_type or "image/jpeg"

            file_metadata = {"name": filename, "parents": [folder_id]}
            media = MediaFileUpload(local_path, mimetype=mime_type)

            uploaded = service.files().create(
                body=file_metadata, media_body=media, fields="id"
            ).execute()

            file_id = uploaded["id"]
            print(f"[drive_uploader] Uploaded (attempt {attempt}), file_id={file_id}")

            service.permissions().create(
                fileId=file_id,
                body={"role": "reader", "type": "anyone"},
            ).execute()
            print(f"[drive_uploader] Made public: file_id={file_id}")

            return f"https://drive.google.com/thumbnail?id={file_id}&sz=w1000"

        except Exception as exc:
            last_error = exc
            print(f"[drive_uploader] Attempt {attempt} FAILED: {exc}")
            traceback.print_exc()
            if attempt < max_attempts:
                time.sleep(attempt * 2)

    print(f"[drive_uploader] All {max_attempts} attempts failed. Last error: {last_error}")
    return None