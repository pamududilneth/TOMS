const DETAIL_FIELDS = [
    { key: "request_id", label: "Key", width: 100 },
    { key: "owner_name", label: "User", width: 130 },
    { key: "reported_date", label: "Reported Date by the Call Centre", width: 150 },
    { key: "reported_time", label: "Reported Time by the Call Centre", width: 150 },
    { key: "customer_name", label: "Customer", width: 150 },
    { key: "stop_category", label: "Vehicle Stop Category", width: 180 },
    { key: "job_no", label: "Job No", width: 120 },
    { key: "vehicle_number", label: "Vehicle No", width: 120 },
    { key: "driver_name", label: "Driver Name", width: 140 },
    { key: "driver_contact_number", label: "Driver Contact No", width: 130 },
    { key: "assigned_coordinator", label: "Vehicle Assigned by (Coordinator Name)", width: 200 },
    { key: "coordinator_mobile_number", label: "Coordinator Mobile No", width: 150 },
    { key: "driver_contacted", label: "Driver Contacted by OKI DOKI", width: 170 },
    { key: "driver_feedback", label: "Driver Feedback - If Contacted", width: 220 },
    { key: "vehicle_parked", label: "Vehicle Parking with Goods", width: 170 },
    { key: "current_parking_location", label: "Vehicle Stopped Location", width: 200 },
    { key: "stopped_date", label: "Vehicle Stopped Date", width: 150 },
    { key: "stopped_time", label: "Vehicle Stopped Time", width: 150 },
    { key: "stopped_datetime_v2", label: "Vehicle Stopped Date & Time - V2", width: 190 },
    { key: "pickup_location", label: "Pickup Location", width: 160 },
    { key: "via_locations", label: "Via Location/s", width: 160 },
    { key: "delivery_location", label: "Delivery Location", width: 160 },
    { key: "duration", label: "Duration", width: 120 },
];

const COLUMNS = DETAIL_FIELDS;

const BREAKDOWN_COLUMNS = [
    { key: "job_number", label: "Record ID", width: 100 },
    { key: "owner_name", label: "Data Entered by", width: 130 },
    { key: "incident_datetime", label: "Incident Date/Time", width: 150 },
    { key: "incident_month", label: "Incident Month", width: 130 },
    { key: "reported_month", label: "Reported Month", width: 130 },
    { key: "time_for_reporting", label: "Time for Reporting", width: 140 },
    { key: "job_no", label: "Job No", width: 130 },
    { key: "customer_name", label: "Customer", width: 150 },
    { key: "vehicle_number", label: "Vehicle No", width: 120 },
    { key: "vehicle_type", label: "Vehicle Type", width: 150 },
    { key: "driver", label: "Driver", width: 130 },
    { key: "supplier_name", label: "Supplier", width: 130 },
    { key: "category", label: "Category", width: 130 },
    { key: "category_detail", label: "Category Detail", width: 220 },
    { key: "injury_category", label: "Injury Category", width: 160 },
    { key: "root_cause", label: "Route Cause", width: 150 },
    { key: "shipment_content", label: "Shipment Content (Goods)", width: 160 },
    { key: "third_party_life", label: "Third Party Life", width: 150 },
    { key: "driver_assistant_life", label: "Driver/Assistant Life", width: 160 },
    { key: "vehicle_impact", label: "Vehicle", width: 160 },
    { key: "third_party_property", label: "Third Party Property", width: 160 },
    { key: "delivery_on_time", label: "Delivery on Time", width: 140 },
    { key: "involvement_of_police", label: "Involvement of Police", width: 150 },
    { key: "legal_impact", label: "Legal Impact", width: 130 },
];

function escapeHtml(value) {
    if (value === null || value === undefined || value === "") return "—";
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function formatCell(incident, key) {
    if (key === "vehicle_parked") return incident.vehicle_parked ? "Yes" : "No";
    if (key === "reported_date" && incident.created_at) {
        return new Date(incident.created_at).toLocaleDateString();
    }
    if (key === "reported_time" && incident.created_at) {
        return new Date(incident.created_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    }
    if (key === "stopped_datetime_v2") {
        if (!incident.stopped_date || !incident.stopped_time) return "—";
        return `${incident.stopped_date} ${incident.stopped_time}`;
    }
    return escapeHtml(incident[key]);
}

function formatBreakdownCell(breakdown, key) {
    if (key === "created_at" && breakdown.created_at) {
        return new Date(breakdown.created_at).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
        });
    }
    return escapeHtml(breakdown[key]);
}

function buildColGroup(fields) {
    return `<colgroup>${fields
        .map((f) => `<col style="width:${f.width}px;">`)
        .join("")}</colgroup>`;
}

const CELL_STYLE =
    "padding:8px 12px;border:1px solid #e4e8f0;white-space:normal;word-wrap:break-word;vertical-align:top;";
const HEADER_CELL_STYLE =
    "padding:10px 12px;text-align:left;border:1px solid #12172a;background:#12172a;color:#ffffff;white-space:normal;word-wrap:break-word;";

// ── Full list of incidents, one row per incident ──
export function buildIncidentTableHTML(incidents, { standalone = false } = {}) {
    const colGroup = buildColGroup(COLUMNS);

    const headerRow = COLUMNS
        .map((c) => `<th style="${HEADER_CELL_STYLE}">${escapeHtml(c.label)}</th>`)
        .join("");

    const bodyRows = incidents
        .map((incident) => {
            const cells = COLUMNS
                .map((c) => `<td style="${CELL_STYLE}">${formatCell(incident, c.key)}</td>`)
                .join("");
            return `<tr style="background:#ffffff;">${cells}</tr>`;
        })
        .join("");

    const table = `
<table cellspacing="0" cellpadding="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:13px;table-layout:fixed;">
  ${colGroup}
  <thead>
    <tr>${headerRow}</tr>
  </thead>
  <tbody>
    ${bodyRows}
  </tbody>
</table>`.trim();

    if (!standalone) return table;

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>TOMS Incident Report</title>
</head>
<body style="margin:24px;font-family:Arial,Helvetica,sans-serif;">
<h2 style="font-family:Arial,Helvetica,sans-serif;color:#12172a;margin-bottom:16px;">
  TOMS Incident Report — Generated ${new Date().toLocaleString()}
</h2>
${table}
</body>
</html>`;
}

// ── Single incident, horizontal table (one header row, one data row) ──
export function buildSingleIncidentTableHTML(incident, { standalone = false } = {}) {
    const colGroup = buildColGroup(DETAIL_FIELDS);

    const headerRow = DETAIL_FIELDS
        .map((f) => `<th style="${HEADER_CELL_STYLE}">${escapeHtml(f.label)}</th>`)
        .join("");

    const valueRow = DETAIL_FIELDS
        .map((f) => `<td style="${CELL_STYLE}">${formatCell(incident, f.key)}</td>`)
        .join("");

    const table = `
<table cellspacing="0" cellpadding="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:13px;table-layout:fixed;">
  ${colGroup}
  <thead>
    <tr>${headerRow}</tr>
  </thead>
  <tbody>
    <tr style="background:#ffffff;">${valueRow}</tr>
  </tbody>
</table>`.trim();

    if (!standalone) return table;

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>TOMS Incident Report — ${escapeHtml(incident.request_id)}</title>
</head>
<body style="margin:24px;font-family:Arial,Helvetica,sans-serif;">
<h2 style="font-family:Arial,Helvetica,sans-serif;color:#12172a;margin-bottom:16px;">
  Incident Report — ${escapeHtml(incident.request_id)}
</h2>
${table}
</body>
</html>`;
}

// ── Full list of breakdowns, one row per breakdown ──
export function buildBreakdownTableHTML(breakdowns, { standalone = false } = {}) {
    const colGroup = buildColGroup(BREAKDOWN_COLUMNS);

    const headerRow = BREAKDOWN_COLUMNS
        .map((c) => `<th style="${HEADER_CELL_STYLE}">${escapeHtml(c.label)}</th>`)
        .join("");

    const bodyRows = breakdowns
        .map((breakdown) => {
            const cells = BREAKDOWN_COLUMNS
                .map((c) => `<td style="${CELL_STYLE}">${formatBreakdownCell(breakdown, c.key)}</td>`)
                .join("");
            return `<tr style="background:#ffffff;">${cells}</tr>`;
        })
        .join("");

    const table = `
<table cellspacing="0" cellpadding="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:13px;table-layout:fixed;">
  ${colGroup}
  <thead>
    <tr>${headerRow}</tr>
  </thead>
  <tbody>
    ${bodyRows}
  </tbody>
</table>`.trim();

    if (!standalone) return table;

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>TOMS Vehicle Breakdown Report</title>
</head>
<body style="margin:24px;font-family:Arial,Helvetica,sans-serif;">
<h2 style="font-family:Arial,Helvetica,sans-serif;color:#12172a;margin-bottom:16px;">
  TOMS Vehicle Breakdown Report — Generated ${new Date().toLocaleString()}
</h2>
${table}
</body>
</html>`;
}

// ── Single breakdown, vertical field/value table, with optional embedded image row ──
export function buildSingleBreakdownTableHTML(breakdown, { standalone = false, imageDataUrl = null } = {}) {
    const rows = BREAKDOWN_COLUMNS.map(({ key, label }) => {
        const value = formatBreakdownCell(breakdown, key);
        return `
    <tr>
      <td style="padding:9px 14px;border:1px solid #e4e8f0;background:#f4f6fb;font-weight:600;width:220px;vertical-align:top;">${escapeHtml(label)}</td>
      <td style="padding:9px 14px;border:1px solid #e4e8f0;">${value}</td>
    </tr>`;
    }).join("");

    const imageRow = imageDataUrl
        ? `
    <tr>
      <td style="padding:9px 14px;border:1px solid #e4e8f0;background:#f4f6fb;font-weight:600;width:220px;vertical-align:top;">Visual Evidence</td>
      <td style="padding:9px 14px;border:1px solid #e4e8f0;"><img src="${imageDataUrl}" alt="Breakdown site" style="max-width:280px;border-radius:6px;display:block;" /></td>
    </tr>`
        : "";

    const table = `
<table cellspacing="0" cellpadding="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:13px;min-width:520px;">
  <tbody>${rows}${imageRow}
  </tbody>
</table>`.trim();

    if (!standalone) return table;

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>TOMS Breakdown Report — ${escapeHtml(breakdown.job_number)}</title>
</head>
<body style="margin:24px;font-family:Arial,Helvetica,sans-serif;">
<h2 style="font-family:Arial,Helvetica,sans-serif;color:#12172a;margin-bottom:16px;">
  Breakdown Report — ${escapeHtml(breakdown.job_number)}
</h2>
${table}
</body>
</html>`;
}