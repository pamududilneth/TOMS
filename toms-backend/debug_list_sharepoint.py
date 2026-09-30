"""
Run to see one level of folders/files inside a SharePoint library at a
given path (non-recursive, so it's always fast).

Usage:
    python debug_list_sharepoint.py                          (lists root)
    python debug_list_sharepoint.py "compliance"              (lists inside that folder)
    python debug_list_sharepoint.py "compliance/Vehicle stop records"
"""
import sys
import requests
from app.utils.graph_excel_client import _get_drive_id, _headers, GRAPH_BASE

LIBRARY_NAME = "Compliance"


def list_one_level(drive_id, path):
    if path:
        url = f"{GRAPH_BASE}/drives/{drive_id}/root:/{path}:/children"
    else:
        url = f"{GRAPH_BASE}/drives/{drive_id}/root/children"

    res = requests.get(url, headers=_headers())
    if res.status_code == 404:
        print(f"404 — nothing found at path: \"{path}\"")
        return
    res.raise_for_status()

    items = res.json().get("value", [])
    if not items:
        print("(empty folder)")
    for item in items:
        tag = "/" if "folder" in item else "   <-- FILE"
        print(f"{item['name']}{tag}")


if __name__ == "__main__":
    start_path = sys.argv[1] if len(sys.argv) > 1 else ""
    drive_id = _get_drive_id(LIBRARY_NAME)
    print(f"Contents of \"{LIBRARY_NAME}/{start_path}\":\n")
    list_one_level(drive_id, start_path)