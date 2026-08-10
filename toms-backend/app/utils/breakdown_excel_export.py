import os
from datetime import datetime
from openpyxl import Workbook, load_workbook
from openpyxl.drawing.image import Image as XLImage
from openpyxl.utils import get_column_letter

# ---> UPDATED FOR DOCKER DEPLOYMENT
EXCEL_DIR = "/app/data/exports"
EXCEL_PATH = os.path.join(EXCEL_DIR, "breakdowns.xlsx")

# Must match UPLOAD_DIR in app/routers/breakdowns.py
# ---> UPDATED FOR DOCKER DEPLOYMENT
UPLOAD_DIR = "/app/uploads/breakdowns"

HEADERS = [
    "Job Number",
    "Vehicle Number",
    "Requesting Plant",
    "Pickup Location",
    "Via Location",
    "Delivery Location",
    "Incident Type",
    "Incident Date & Time",
    "Breakdown/Accident Location",
    "Reason",
    "Image Filename",
    "Monitoring Center Action",
    "Priority",
    "Status",
    "Submitted At",
    "Image Preview",  # new — actual embedded picture goes here
]

IMAGE_COL_INDEX = len(HEADERS)  # 1-based column position of "Image Preview"
IMAGE_COL_LETTER = get_column_letter(IMAGE_COL_INDEX)

THUMB_WIDTH_PX = 160
THUMB_HEIGHT_PX = 110


def _ensure_workbook():
    os.makedirs(EXCEL_DIR, exist_ok=True)
    if not os.path.exists(EXCEL_PATH):
        wb = Workbook()
        ws = wb.active
        ws.title = "Breakdowns"
        ws.append(HEADERS)
        ws.column_dimensions[IMAGE_COL_LETTER].width = 24
        wb.save(EXCEL_PATH)


def _embed_image(ws, row_number: int, image_filename: str):
    image_path = os.path.join(UPLOAD_DIR, image_filename)
    if not os.path.exists(image_path):
        return

    try:
        img = XLImage(image_path)
        img.width = THUMB_WIDTH_PX
        img.height = THUMB_HEIGHT_PX
        ws.add_image(img, f"{IMAGE_COL_LETTER}{row_number}")

        # Make the row tall enough to actually show the thumbnail
        # (Excel row height is in points; ~0.75 points per pixel)
        ws.row_dimensions[row_number].height = THUMB_HEIGHT_PX * 0.75
    except Exception:
        # If the image is corrupt/unsupported, don't block the whole submission —
        # the row still gets saved with just the filename as before.
        pass


def append_breakdown_row(breakdown):
    _ensure_workbook()

    try:
        wb = load_workbook(EXCEL_PATH)
        ws = wb["Breakdowns"]

        ws.append([
            breakdown.job_number,
            breakdown.vehicle_number,
            breakdown.requesting_plant,
            breakdown.pickup_location,
            breakdown.via_location,
            breakdown.delivery_location,
            breakdown.incident_type,
            breakdown.incident_datetime,
            breakdown.location,
            breakdown.reason,
            breakdown.image_filename,
            breakdown.action_taken,
            breakdown.priority,
            breakdown.status,
            breakdown.created_at.strftime("%Y-%m-%d %H:%M:%S")
            if breakdown.created_at else datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "",  # Image Preview column stays text-empty; picture is layered on top
        ])

        row_number = ws.max_row

        if breakdown.image_filename:
            _embed_image(ws, row_number, breakdown.image_filename)

        wb.save(EXCEL_PATH)

    except PermissionError as exc:
        raise RuntimeError(
            "Could not write to breakdowns.xlsx — close the file in Excel and try again."
        ) from exc