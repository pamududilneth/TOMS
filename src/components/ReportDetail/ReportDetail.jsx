import { useState } from "react";
import "./ReportDetail.css";
import ReportField from "../ReportField/ReportField";
import { buildSingleIncidentTableHTML } from "../../utils/reportTable";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { copyIncidentTableToClipboard } from "../../utils/clipboardCopy";

import { FiPrinter, FiDownload, FiCopy, FiEdit2, FiTrash2, FiAlertTriangle, FiUser, FiMapPin, FiFileText, FiCheckCircle } from "react-icons/fi";



function formatDateTime(value) {
    if (!value) return "—";
    const date = new Date(value);
    return date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

function ReportDetail({ incident, onDeleted }) {
    const [copyStatus, setCopyStatus] = useState("");
    const navigate = useNavigate();
    const { user } = useAuth();
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
        try {
            await copyIncidentTableToClipboard(incident);
            setCopyStatus("Copied! Paste into your Outlook email.");
        } catch (err) {
            console.error("[copy] Clipboard write failed:", err);
            setCopyStatus("Copy failed — try again.");
        }
        setTimeout(() => setCopyStatus(""), 3500);
    }

    async function handleDelete() {
        const confirmed = window.confirm(
            `Delete incident ${incident.request_id}? This cannot be undone.`
        );
        if (!confirmed) return;

        try {
            await api.deleteIncident(incident.id);
            onDeleted?.();
        } catch (err) {
            alert(err.message);
        }
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
                    <button
                        type="button"
                        className="print-btn"
                        onClick={() => navigate(`/stop-management/edit/${incident.id}`)}
                    >
                        <FiEdit2 />
                        Edit
                    </button>
                    {user?.role === "admin" && (
                        <button type="button" className="print-btn btn-danger" onClick={handleDelete}>
                            <FiTrash2 />
                            Delete
                        </button>
                    )}
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