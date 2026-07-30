
// ── Edit widths here — just change the number (in px) for any field ──
const DETAIL_FIELDS = [
    { key: "request_id", label: "Request ID", width: 130 },
    { key: "vehicle_number", label: "Vehicle Number", width: 120 },
    { key: "driver_name", label: "Driver Name", width: 140 },
    { key: "driver_contact_number", label: "Driver Contact", width: 120 },
    { key: "assigned_coordinator", label: "Coordinator", width: 140 },
    { key: "coordinator_mobile_number", label: "Coordinator Mobile", width: 130 },
    { key: "current_parking_location", label: "Current Parking Location", width: 180 },
    { key: "parked_time", label: "Parked Time", width: 100 },
    { key: "pickup_location", label: "Pickup Location", width: 160 },
    { key: "via_locations", label: "Via Location(s)", width: 160 },
    { key: "delivery_location", label: "Delivery Location", width: 160 },
    { key: "driver_contacted", label: "Driver Contacted", width: 110 },
    { key: "driver_feedback", label: "Driver Feedback", width: 220 },
    { key: "vehicle_parked", label: "Vehicle Parked", width: 100 },
    { key: "approver", label: "Approver", width: 130 },
    { key: "client_name", label: "Client", width: 140 },
    { key: "status", label: "Status", width: 100 },
    { key: "created_at", label: "Submitted At", width: 150 },
];

// ── List/report-table columns (used elsewhere) — same idea, separate widths ──
const COLUMNS = [
    { key: "request_id", label: "Request ID", width: 130 },
    { key: "vehicle_number", label: "Vehicle Number", width: 120 },
    { key: "driver_name", label: "Driver Name", width: 140 },
    { key: "driver_contact_number", label: "Driver Contact", width: 120 },
    { key: "assigned_coordinator", label: "Coordinator", width: 140 },
    { key: "coordinator_mobile_number", label: "Coordinator Mobile", width: 130 },
    { key: "current_parking_location", label: "Current Parking Location", width: 180 },
    { key: "parked_time", label: "Parked Time", width: 100 },
    { key: "pickup_location", label: "Pickup Location", width: 160 },
    { key: "via_locations", label: "Via Location(s)", width: 160 },
    { key: "delivery_location", label: "Delivery Location", width: 160 },
    { key: "driver_contacted", label: "Driver Contacted", width: 110 },
    { key: "driver_feedback", label: "Driver Feedback", width: 220 },
    { key: "vehicle_parked", label: "Vehicle Parked", width: 100 },
    { key: "approver", label: "Approver", width: 130 },
    { key: "client_name", label: "Client", width: 140 },
    { key: "status", label: "Status", width: 100 },
    { key: "created_at", label: "Submitted At", width: 150 },
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

// ── Single incident, one row, one table ──
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

/*
const COLUMNS = [
    { key: "request_id", label: "Request ID" },
    { key: "vehicle_number", label: "Vehicle Number" },
    { key: "driver_name", label: "Driver Name" },
    { key: "driver_contact_number", label: "Driver Contact" },
    { key: "assigned_coordinator", label: "Coordinator" },
    { key: "coordinator_mobile_number", label: "Coordinator Mobile" },
    { key: "current_parking_location", label: "Current Parking Location" },
    { key: "parked_time", label: "Parked Time" },
    { key: "pickup_location", label: "Pickup Location" },
    { key: "via_locations", label: "Via Location(s)" },
    { key: "delivery_location", label: "Delivery Location" },
    { key: "driver_contacted", label: "Driver Contacted" },
    { key: "driver_feedback", label: "Driver Feedback" },
    { key: "vehicle_parked", label: "Vehicle Parked" },
    { key: "approver", label: "Approver" },
    { key: "client_name", label: "Client" },
    { key: "status", label: "Status" },
    { key: "created_at", label: "Submitted At" },
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

export function buildIncidentTableHTML(incidents, { standalone = false } = {}) {
    const headerRow = COLUMNS.map((c) => `<th>${c.label}</th>`).join("");

    const bodyRows = incidents
        .map((incident) => {
            const cells = COLUMNS.map(
                (c) => `<td>${formatCell(incident, c.key)}</td>`
            ).join("");
            return `<tr>${cells}</tr>`;
        })
        .join("");

    const table = `
<table cellspacing="0" cellpadding="0" style="border-collapse:collapse;width:100%;font-family:Arial,Helvetica,sans-serif;font-size:13px;">
  <thead>
    <tr style="background:#12172a;color:#ffffff;">${headerRow
            .split("</th>")
            .filter(Boolean)
            .map(
                (h) =>
                    h.replace(
                        "<th>",
                        '<th style="padding:10px 12px;text-align:left;border:1px solid #12172a;white-space:nowrap;">'
                    ) + "</th>"
            )
            .join("")}</tr>
  </thead>
  <tbody>
    ${bodyRows
            .replace(/<td>/g, '<td style="padding:8px 12px;border:1px solid #e4e8f0;">')
            .replace(/<tr>/g, '<tr style="background:#ffffff;">')}
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

const DETAIL_FIELDS = [
    { key: "request_id", label: "Request ID" },
    { key: "vehicle_number", label: "Vehicle Number" },
    { key: "driver_name", label: "Driver Name" },
    { key: "driver_contact_number", label: "Driver Contact Number" },
    { key: "assigned_coordinator", label: "Assigned Coordinator" },
    { key: "coordinator_mobile_number", label: "Coordinator Mobile Number" },
    { key: "current_parking_location", label: "Current Parking Location" },
    { key: "parked_time", label: "Parked Time" },
    { key: "pickup_location", label: "Pickup Location" },
    { key: "via_locations", label: "Via Location(s)" },
    { key: "delivery_location", label: "Delivery Location" },
    { key: "driver_contacted", label: "Driver Contacted" },
    { key: "driver_feedback", label: "Driver Feedback" },
    { key: "vehicle_parked", label: "Vehicle Parked" },
    { key: "approver", label: "Approver" },
    { key: "client_name", label: "Client" },
    { key: "status", label: "Status" },
    { key: "created_at", label: "Submitted At" },
];



// horizontal compact

const WRAP_FIELDS = new Set([
    "current_parking_location",
    "pickup_location",
    "via_locations",
    "delivery_location",
    "driver_feedback",
]);

export function buildSingleIncidentTableHTML(incident, { standalone = false } = {}) {
    const headerCells = DETAIL_FIELDS
        .map(({ label }) => {
            return `<th style="padding:10px 12px;text-align:left;border:1px solid #12172a;background:#12172a;color:#ffffff;">${escapeHtml(label)}</th>`;
        })
        .join("");

    const valueCells = DETAIL_FIELDS
        .map(({ key }) => {
            const wrap = WRAP_FIELDS.has(key);
            const style = wrap
                ? "padding:8px 12px;border:1px solid #e4e8f0;max-width:200px;white-space:normal;word-wrap:break-word;vertical-align:top;"
                : "padding:8px 12px;border:1px solid #e4e8f0;white-space:nowrap;vertical-align:top;";
            return `<td style="${style}">${formatCell(incident, key)}</td>`;
        })
        .join("");

    const headerRow = DETAIL_FIELDS
        .map(({ label, key }) => {
            const wrap = WRAP_FIELDS.has(key);
            const style = wrap
                ? "padding:10px 12px;text-align:left;border:1px solid #12172a;background:#12172a;color:#ffffff;max-width:200px;"
                : "padding:10px 12px;text-align:left;border:1px solid #12172a;background:#12172a;color:#ffffff;white-space:nowrap;";
            return `<th style="${style}">${escapeHtml(label)}</th>`;
        })
        .join("");

    const table = `
<table cellspacing="0" cellpadding="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:13px;table-layout:fixed;">
  <thead>
    <tr>${headerRow}</tr>
  </thead>
  <tbody>
    <tr style="background:#ffffff;">${valueCells}</tr>
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


// vertical table  -------------------------------

// export function buildSingleIncidentTableHTML(incident, { standalone = false } = {}) {
//     const rows = DETAIL_FIELDS.map(({ key, label }) => {
//         const value = formatCell(incident, key);
//         return `
//     <tr>
//       <td style="padding:9px 14px;border:1px solid #e4e8f0;background:#f4f6fb;font-weight:600;width:220px;">${escapeHtml(label)}</td>
//       <td style="padding:9px 14px;border:1px solid #e4e8f0;">${value}</td>
//     </tr>`;
//     }).join("");

//     const table = `
// <table cellspacing="0" cellpadding="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:13px;min-width:520px;">
//   <tbody>${rows}
//   </tbody>
// </table>`.trim();

//     if (!standalone) return table;

//     return `<!DOCTYPE html>
// <html>
// <head>
// <meta charset="UTF-8" />
// <title>TOMS Incident Report — ${escapeHtml(incident.request_id)}</title>
// </head>
// <body style="margin:24px;font-family:Arial,Helvetica,sans-serif;">
// <h2 style="font-family:Arial,Helvetica,sans-serif;color:#12172a;margin-bottom:16px;">
//   Incident Report — ${escapeHtml(incident.request_id)}
// </h2>
// ${table}
// </body>
// </html>`;
// }


// horizontal table  ---------------------------------------

// export function buildSingleIncidentTableHTML(incident, { standalone = false } = {}) {
//     const headerCells = DETAIL_FIELDS
//         .map(
//             ({ label }) =>
//                 `<th style="padding:10px 12px;text-align:left;border:1px solid #12172a;background:#12172a;color:#ffffff;white-space:nowrap;">${escapeHtml(label)}</th>`
//         )
//         .join("");

//     const valueCells = DETAIL_FIELDS
//         .map(
//             ({ key }) =>
//                 `<td style="padding:8px 12px;border:1px solid #e4e8f0;white-space:nowrap;">${formatCell(incident, key)}</td>`
//         )
//         .join("");

//     const table = `
// <table cellspacing="0" cellpadding="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:13px;">
//   <thead>
//     <tr>${headerCells}</tr>
//   </thead>
//   <tbody>
//     <tr style="background:#ffffff;">${valueCells}</tr>
//   </tbody>
// </table>`.trim();

//     if (!standalone) return table;

//     return `<!DOCTYPE html>
// <html>
// <head>
// <meta charset="UTF-8" />
// <title>TOMS Incident Report — ${escapeHtml(incident.request_id)}</title>
// </head>
// <body style="margin:24px;font-family:Arial,Helvetica,sans-serif;">
// <h2 style="font-family:Arial,Helvetica,sans-serif;color:#12172a;margin-bottom:16px;">
//   Incident Report — ${escapeHtml(incident.request_id)}
// </h2>
// ${table}
// </body>
// </html>`;
// }     */