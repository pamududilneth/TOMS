import os
from datetime import datetime
from openpyxl import Workbook, load_workbook

EXCEL_DIR = os.path.join(os.path.expanduser("~"), "Downloads")
EXCEL_PATH = os.path.join(EXCEL_DIR, "Breakdowns_Accident.xlsx")

HEADERS = [
    "Record ID",
    "Data Entered by",
    "Incident Date/Time",
    "Incident Month",
    "Reported Date/Time to the Compliance Team",
    "Reported Month",
    "Time for Reporting",
    "Job No",
    "Incident Reference No by Compliance Team",
    "Customer",
    "Vehicle No",
    "Vehicle Type",
    "Driver",
    "Supplier",
    "Category",
    "Category Detail",
    "Injury Category",
    "Route Cause",
    "Shipment Content (Goods)",
    "Third Party Life",
    "Driver/Assistant Life",
    "Vehicle",
    "Third Party Property",
    "Delivery on Time",
    "Combined Result",
    "Severity Level",
    "Severity Classification",
    "Involvement of Police",
    "Legal Impact",
    "Customer Claim",
    "Other Cost",
    "Financial Impact",
    "Action",
    "Action Taken Date",
    "Remark",
    "Status",
    "Action Closing Date",
    "Time for Action Closing",
    "Applicability of Correction",
    "Correction",
    "Applicability of Corrective Action",
    "Corrective Action",
    "Responsible Person for Corrective Action",
    "Target Date for Corrective Action",
    "Target Month for Corrective Action",
    "Status for Corrective Action",
]


def _ensure_workbook():
    os.makedirs(EXCEL_DIR, exist_ok=True)
    if not os.path.exists(EXCEL_PATH):
        wb = Workbook()
        ws = wb.active
        ws.title = "Breakdowns"
        ws.append(HEADERS)
        wb.save(EXCEL_PATH)


def append_breakdown_row(
    breakdown,
    username: str,
    customer_name: str,
    supplier_name: str,
    incident_dt,
    reported_dt,
    incident_month: str,
    reported_month: str,
    time_for_reporting: str,
):
    _ensure_workbook()

    try:
        wb = load_workbook(EXCEL_PATH)
        ws = wb["Breakdowns"]

        ws.append([
            breakdown.job_number,               # Record ID
            username,                           # Data Entered by
            incident_dt,                        # Incident Date/Time (real datetime object)
            incident_month,                     # Incident Month
            reported_dt,                        # Reported Date/Time to the Compliance Team (real datetime object)
            reported_month,                     # Reported Month
            time_for_reporting,                 # Time for Reporting
            breakdown.job_no,                   # Job No
            "",                                 # Incident Reference No by Compliance Team (manual)
            customer_name,                      # Customer
            breakdown.vehicle_number,           # Vehicle No
            breakdown.vehicle_type,             # Vehicle Type
            breakdown.driver,                   # Driver
            supplier_name,                      # Supplier
            breakdown.category,                 # Category
            breakdown.category_detail,          # Category Detail
            breakdown.injury_category,          # Injury Category
            breakdown.root_cause,               # Route Cause
            breakdown.shipment_content,         # Shipment Content (Goods)
            breakdown.third_party_life,         # Third Party Life
            breakdown.driver_assistant_life,    # Driver/Assistant Life
            breakdown.vehicle_impact,           # Vehicle
            breakdown.third_party_property,     # Third Party Property
            breakdown.delivery_on_time,         # Delivery on Time
            "",                              # Combined Result (manual)
            "",                              # Severity Level (manual)
            "",                              # Severity Classification (manual)
            breakdown.involvement_of_police,    # Involvement of Police
            breakdown.legal_impact,             # Legal Impact
            "", "", "", "", "", "", "", "", "",  # Customer Claim ... Action Closing Date
            "", "", "", "", "", "", "", "",      # Time for Action Closing ... Status for Corrective Action
        ])

        wb.save(EXCEL_PATH)

    except PermissionError as exc:
        raise RuntimeError(
            "Could not write to breakdowns.xlsx — close the file in Excel and try again."
        ) from exc