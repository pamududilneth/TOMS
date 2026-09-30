import os
from .graph_excel_client import append_row as graph_append_row

BREAKDOWNS_FILE_PATH = os.getenv("SHAREPOINT_BREAKDOWNS_FILE_PATH", "/Shared Documents/Breakdowns_Accident.xlsx")
BREAKDOWNS_TABLE_NAME = "BreakdownsTable"

HEADERS = [
    "Record ID", "Data Entered by", "Incident Date/Time", "Incident Month",
    "Reported Date/Time to the Compliance Team", "Reported Month", "Time for Reporting",
    "Job No", "Incident Reference No by Compliance Team", "Customer", "Vehicle No",
    "Vehicle Type", "Driver", "Supplier", "Category", "Category Detail", "Injury Category",
    "Route Cause", "Shipment Content (Goods)", "Third Party Life", "Driver/Assistant Life",
    "Vehicle", "Third Party Property", "Delivery on Time", "Combined Result", "Severity Level",
    "Severity Classification", "Involvement of Police", "Legal Impact", "Customer Claim",
    "Other Cost", "Financial Impact", "Action", "Action Taken Date", "Remark", "Status",
    "Action Closing Date", "Time for Action Closing", "Applicability of Correction",
    "Correction", "Applicability of Corrective Action", "Corrective Action",
    "Responsible Person for Corrective Action", "Target Date for Corrective Action",
    "Target Month for Corrective Action", "Status for Corrective Action",
]


def append_breakdown_row(
    breakdown, username, customer_name, supplier_name,
    incident_dt, reported_dt, incident_month, reported_month, time_for_reporting,
):
    row_values = [
        breakdown.job_number, username,
        incident_dt.strftime("%Y-%m-%d %H:%M:%S") if incident_dt else "",
        incident_month,
        reported_dt.strftime("%Y-%m-%d %H:%M:%S") if reported_dt else "",
        reported_month, time_for_reporting,
        breakdown.job_no, "", customer_name,
        breakdown.vehicle_number, breakdown.vehicle_type, breakdown.driver, supplier_name,
        breakdown.category, breakdown.category_detail, breakdown.injury_category,
        breakdown.root_cause, breakdown.shipment_content, breakdown.third_party_life,
        breakdown.driver_assistant_life, breakdown.vehicle_impact, breakdown.third_party_property,
        breakdown.delivery_on_time, "", "", "",
        breakdown.involvement_of_police, breakdown.legal_impact,
        "", "", "", "", "", "", "", "", "",
        "", "", "", "", "", "", "", "",
    ]

    graph_append_row(BREAKDOWNS_FILE_PATH, BREAKDOWNS_TABLE_NAME, HEADERS, row_values)