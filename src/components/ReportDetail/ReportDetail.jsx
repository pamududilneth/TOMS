import { useState } from "react";
import "./ReportDetail.css";
import ReportField from "../ReportField/ReportField";
import { buildSingleIncidentTableHTML } from "../../utils/reportTable";
import {
    FiPrinter,
    FiDownload,
    FiCopy,
    FiAlertTriangle,
    FiUser,
    FiMapPin,
    FiFileText,
    FiCheckCircle
} from "react-icons/fi";

function formatDateTime(value) {
    if (!value) return "—";
    const date = new Date(value);
    return date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

function ReportDetail({ incident }) {
    const [copyStatus, setCopyStatus] = useState("");

    if (!incident) {
        return (
            <div className="report-detail-empty">
                <FiFileText size={28} />
                <p>Select an incident from the list to view its full report.</p>
            </div>
        );
    }

    function handleDownloadHtml() {
        const html = buildSingleIncidentTableHTML(incident, { standalone: true });
        const blob = new Blob([html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `TOMS-incident-${incident.request_id}.html`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    async function handleCopyForEmail() {
        const html = buildSingleIncidentTableHTML(incident, { standalone: false });
        const plain = `Incident Report — ${incident.request_id}`;

        try {
            if (navigator.clipboard && window.ClipboardItem) {
                const item = new ClipboardItem({
                    "text/html": new Blob([html], { type: "text/html" }),
                    "text/plain": new Blob([plain], { type: "text/plain" }),
                });
                await navigator.clipboard.write([item]);
            } else {
                await navigator.clipboard.writeText(plain);
            }
            setCopyStatus("Copied! Paste into your Outlook email.");
        } catch {
            setCopyStatus("Copy failed — try Download instead.");
        }

        setTimeout(() => setCopyStatus(""), 3500);
    }

    return (
        <div className="report-detail" id="report-print-area">

            <div className="report-detail-header">
                <div>
                    <span className="report-detail-eyebrow">Incident Report</span>
                    <h1>{incident.request_id}</h1>
                    <p className="report-detail-meta">
                        Submitted {formatDateTime(incident.created_at)}
                    </p>
                </div>

                <div className="report-detail-actions">
                    <span className={`status-badge status-${incident.status}`}>
                        {incident.status}
                    </span>
                    <button type="button" className="print-btn" onClick={handleDownloadHtml}>
                        <FiDownload />
                        Download as HTML
                    </button>
                    <button type="button" className="print-btn" onClick={handleCopyForEmail}>
                        <FiCopy />
                        Copy Table for Email
                    </button>
                    <button type="button" className="print-btn" onClick={() => window.print()}>
                        <FiPrinter />
                        Print / Save as PDF
                    </button>
                </div>
            </div>

            {copyStatus && <p className="report-copy-status">{copyStatus}</p>}

            <div className="report-section">
                <div className="report-section-title">
                    <FiAlertTriangle />
                    Incident & Vehicle Info
                </div>
                <div className="report-grid">
                    <ReportField label="Request ID" value={incident.request_id} />
                    <ReportField label="Vehicle Number" value={incident.vehicle_number} />
                </div>
            </div>

            <div className="report-section">
                <div className="report-section-title">
                    <FiUser />
                    Personnel Details
                </div>
                <div className="report-grid">
                    <ReportField label="Driver Name" value={incident.driver_name} />
                    <ReportField label="Driver Contact Number" value={incident.driver_contact_number} />
                    <ReportField label="Assigned Coordinator" value={incident.assigned_coordinator} />
                    <ReportField label="Coordinator Mobile Number" value={incident.coordinator_mobile_number} />
                </div>
            </div>

            <div className="report-section">
                <div className="report-section-title">
                    <FiMapPin />
                    Parking & Location
                </div>
                <div className="report-grid">
                    <ReportField label="Current Parking Location" value={incident.current_parking_location} />
                    <ReportField label="Parked Time" value={incident.parked_time} />
                    <ReportField label="Pickup Location" value={incident.pickup_location} />
                    <ReportField label="Via Location(s)" value={incident.via_locations} />
                    <ReportField label="Delivery Location" value={incident.delivery_location} />
                </div>
            </div>

            <div className="report-section">
                <div className="report-section-title">
                    <FiCheckCircle />
                    Status & Feedback
                </div>
                <div className="report-grid">
                    <ReportField label="Driver Contacted" value={incident.driver_contacted} />
                    <ReportField label="Vehicle Parked" value={incident.vehicle_parked ? "Yes" : "No"} />
                    <ReportField label="Driver Feedback" value={incident.driver_feedback} fullWidth />
                </div>
            </div>

            <div className="report-section">
                <div className="report-section-title">
                    <FiFileText />
                    Reporting
                </div>
                <div className="report-grid">
                    <ReportField label="Approver" value={incident.approver} />
                    <ReportField label="Client" value={incident.client_name} />
                </div>
            </div>

        </div>
    );
}

export default ReportDetail;