const DETAIL_FIELDS = [
    { key: "request_id", label: "Request ID", width: 130 },
    { key: "vehicle_number", label: "Vehicle Number", width: 120 },
    { key: "driver_name", label: "Driver Name", width: 140 },
    { key: "driver_contact_number", label: "Driver contact number", width: 130 },
    { key: "assigned_coordinator", label: "Vehicle Assigned Coordinator", width: 170 },
    { key: "coordinator_mobile_number", label: "Coordinator mobile number", width: 150 },
    { key: "driver_contacted", label: "Driver Contacted YES/NO", width: 150 },
    { key: "driver_feedback", label: "If contacted driver feedback", width: 220 },
    { key: "vehicle_parked", label: "Is the vehicle parked with the goods YES/NO", width: 200 },
    { key: "current_parking_location", label: "Where the vehicle is currently parked", width: 200 },
    { key: "parked_time", label: "Parked time", width: 150 },
    { key: "pickup_location", label: "Pickup Location", width: 160 },
    { key: "via_locations", label: "Via Location/Locations", width: 160 },
    { key: "delivery_location", label: "Delivery Location", width: 160 },
    { key: "approver", label: "Approver", width: 130 },
];

const COLUMNS = DETAIL_FIELDS;

const BREAKDOWN_COLUMNS = [
    { key: "job_number", label: "Job Number", width: 130 },
    { key: "vehicle_number", label: "Vehicle Number", width: 120 },
    { key: "requesting_plant", label: "Requesting Plant", width: 200 },
    { key: "pickup_location", label: "Pickup Location", width: 160 },
    { key: "via_location", label: "Via Location", width: 160 },
    { key: "delivery_location", label: "Delivery Location", width: 160 },
    { key: "incident_type", label: "Incident (Break down/ Accident)", width: 180 },
    { key: "reason", label: "Reason", width: 220 },
    { key: "location", label: "Break down / Accident happened location", width: 220 },
    { key: "incident_datetime", label: "Date & Time", width: 150 },
    { key: "image_filename", label: "Image of the breakdown place", width: 200 },
    { key: "action_taken", label: "Monitoring center Action", width: 220 },
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
    if (key === "created_at" && incident.created_at) {
        return new Date(incident.created_at).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
        });
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