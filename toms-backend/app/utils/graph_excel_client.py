import os
import time
import requests
import msal
from dotenv import load_dotenv

load_dotenv()

GRAPH_TENANT_ID = os.getenv("GRAPH_TENANT_ID")
GRAPH_CLIENT_ID = os.getenv("GRAPH_CLIENT_ID")
GRAPH_CLIENT_SECRET = os.getenv("GRAPH_CLIENT_SECRET")

SHAREPOINT_HOSTNAME = os.getenv("SHAREPOINT_HOSTNAME")
SHAREPOINT_SITE_PATH = os.getenv("SHAREPOINT_SITE_PATH")

GRAPH_BASE = "https://graph.microsoft.com/v1.0"

_app = None
_token_cache = {"token": None, "expires_at": 0}
_site_id_cache = None
_drive_id_cache = {}     # library_name -> drive_id
_item_id_cache = {}      # file_path -> (drive_id, item_id)


def _get_app():
    global _app
    if _app is None:
        _app = msal.ConfidentialClientApplication(
            GRAPH_CLIENT_ID,
            authority=f"https://login.microsoftonline.com/{GRAPH_TENANT_ID}",
            client_credential=GRAPH_CLIENT_SECRET,
        )
    return _app


def _get_token() -> str:
    now = time.time()
    if _token_cache["token"] and now < _token_cache["expires_at"] - 60:
        return _token_cache["token"]

    result = _get_app().acquire_token_for_client(scopes=["https://graph.microsoft.com/.default"])
    if "access_token" not in result:
        raise RuntimeError(f"Failed to acquire Graph token: {result.get('error_description', result)}")

    _token_cache["token"] = result["access_token"]
    _token_cache["expires_at"] = now + result.get("expires_in", 3600)
    return _token_cache["token"]


def _headers():
    return {"Authorization": f"Bearer {_get_token()}", "Content-Type": "application/json"}


def _get_site_id() -> str:
    global _site_id_cache
    if _site_id_cache:
        return _site_id_cache

    url = f"{GRAPH_BASE}/sites/{SHAREPOINT_HOSTNAME}:{SHAREPOINT_SITE_PATH}"
    res = requests.get(url, headers=_headers())
    res.raise_for_status()
    _site_id_cache = res.json()["id"]
    return _site_id_cache


def _split_library_path(file_path: str):
    """'/Compliance/Unplanned Stops.xlsx' -> ('Compliance', '/Unplanned Stops.xlsx')"""
    parts = file_path.strip("/").split("/", 1)
    if len(parts) != 2:
        raise ValueError(
            f"File path must be '/<Library Name>/<...file path>', got: {file_path}"
        )
    return parts[0], "/" + parts[1]


def _get_drive_id(library_name: str) -> str:
    if library_name in _drive_id_cache:
        return _drive_id_cache[library_name]

    site_id = _get_site_id()
    url = f"{GRAPH_BASE}/sites/{site_id}/drives"
    res = requests.get(url, headers=_headers())
    res.raise_for_status()
    drives = res.json().get("value", [])

    for d in drives:
        if d["name"].lower() == library_name.lower():
            _drive_id_cache[library_name] = d["id"]
            return d["id"]

    available = ", ".join(f'"{d["name"]}"' for d in drives) or "(none returned)"
    raise RuntimeError(
        f"No document library named \"{library_name}\" on this site. "
        f"Available libraries: {available}"
    )


def _get_item_id(file_path: str):
    if file_path in _item_id_cache:
        return _item_id_cache[file_path]

    library_name, relative_path = _split_library_path(file_path)
    drive_id = _get_drive_id(library_name)

    url = f"{GRAPH_BASE}/drives/{drive_id}/root:{relative_path}"
    res = requests.get(url, headers=_headers())
    if res.status_code == 404:
        raise RuntimeError(
            f"Found library \"{library_name}\" but no file at \"{relative_path}\" inside it. "
            f"Check spelling/capitalization/subfolders exactly as shown in SharePoint."
        )
    res.raise_for_status()
    item_id = res.json()["id"]

    _item_id_cache[file_path] = (drive_id, item_id)
    return _item_id_cache[file_path]


def _workbook_url(file_path: str, suffix: str = "") -> str:
    drive_id, item_id = _get_item_id(file_path)
    return f"{GRAPH_BASE}/drives/{drive_id}/items/{item_id}/workbook{suffix}"


def _column_letter(n: int) -> str:
    letters = ""
    while n > 0:
        n, remainder = divmod(n - 1, 26)
        letters = chr(65 + remainder) + letters
    return letters


# def _ensure_table(file_path: str, table_name: str, headers: list[str]) -> str:
#     res = requests.get(_workbook_url(file_path, "/tables"), headers=_headers())
#     res.raise_for_status()

#     for t in res.json().get("value", []):
#         if t["name"] == table_name:
#             return table_name

#     end_col = _column_letter(len(headers))
#     payload = {"address": f"Sheet1!A1:{end_col}1", "hasHeaders": True}

#     res = requests.post(_workbook_url(file_path, "/tables/add"), headers=_headers(), json=payload)
#     res.raise_for_status()
#     new_table = res.json()

#     requests.patch(
#         _workbook_url(file_path, f"/tables/{new_table['id']}"),
#         headers=_headers(),
#         json={"name": table_name},
#     )
#     return table_name

def _get_first_worksheet_name(file_path: str) -> str:
    res = requests.get(_workbook_url(file_path, "/worksheets"), headers=_headers())
    res.raise_for_status()
    sheets = res.json().get("value", [])
    if not sheets:
        raise RuntimeError(f"Workbook at {file_path} has no worksheets.")
    return sheets[0]["name"]


def _get_used_range_address(file_path: str, sheet_name: str) -> str:
    """Returns just the cell range part, e.g. 'A1:T5', of whatever data already exists."""
    url = _workbook_url(file_path, f"/worksheets('{sheet_name}')/usedRange(valuesOnly=true)")
    res = requests.get(url + "?$select=address", headers=_headers())
    res.raise_for_status()
    full_address = res.json()["address"]  # e.g. "Sheet1!A1:T5"
    return full_address.split("!", 1)[1]


def _ensure_table(file_path: str, table_name: str, headers: list[str]) -> str:
    res = requests.get(_workbook_url(file_path, "/tables"), headers=_headers())
    res.raise_for_status()

    for t in res.json().get("value", []):
        if t["name"] == table_name:
            return table_name

    sheet_name = _get_first_worksheet_name(file_path)

    try:
        used_range = _get_used_range_address(file_path, sheet_name)
        address = f"'{sheet_name}'!{used_range}"
    except requests.HTTPError:
        # Sheet is genuinely empty — fall back to just the header row.
        end_col = _column_letter(len(headers))
        address = f"'{sheet_name}'!A1:{end_col}1"

    payload = {"address": address, "hasHeaders": True}
    res = requests.post(_workbook_url(file_path, "/tables/add"), headers=_headers(), json=payload)
    res.raise_for_status()
    new_table = res.json()

    requests.patch(
        _workbook_url(file_path, f"/tables/{new_table['id']}"),
        headers=_headers(),
        json={"name": table_name},
    )
    return table_name


def append_row(file_path: str, table_name: str, headers: list[str], row_values: list):
    try:
        _ensure_table(file_path, table_name, headers)
        url = _workbook_url(file_path, f"/tables/{table_name}/rows/add")
        res = requests.post(url, headers=_headers(), json={"values": [row_values]})
        res.raise_for_status()
    except requests.HTTPError as exc:
        raise RuntimeError(f"SharePoint Excel write failed ({file_path}): {exc.response.text}") from exc
    except RuntimeError:
        raise
    except Exception as exc:
        raise RuntimeError(f"SharePoint Excel write failed ({file_path}): {exc}") from exc


def get_file_web_url(file_path: str) -> str:
    drive_id, item_id = _get_item_id(file_path)
    url = f"{GRAPH_BASE}/drives/{drive_id}/items/{item_id}"
    res = requests.get(url, headers=_headers())
    res.raise_for_status()
    return res.json()["webUrl"]