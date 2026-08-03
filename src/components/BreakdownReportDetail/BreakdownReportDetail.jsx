import { useState } from "react";
import "./BreakdownReportDetail.css";
import ReportField from "../ReportField/ReportField";
import { buildSingleBreakdownTableHTML } from "../../utils/reportTable";
import { useNavigate } from "react-router-dom";
import {
    FiPrinter,
    FiDownload,
    FiCopy,
    FiBriefcase,
    FiNavigation,
    FiAlertTriangle,
    FiCheckSquare,
    FiTruck,
    FiEdit2,
} from "react-icons/fi";



function formatDateTime(value) {
    if (!value) return "—";
    return new Date(value).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

function BreakdownReportDetail({ breakdown }) {
    const navigate = useNavigate();
    const [copyStatus, setCopyStatus] = useState("");

    if (!breakdown) {
        return (
            <div className="report-detail-empty">
                <FiTruck size={28} />
                <p>Select a breakdown from the list to view its full report.</p>
            </div>
        );
    }

    function handleDownloadHtml() {
        const html = buildSingleBreakdownTableHTML(breakdown, { standalone: true });
        const blob = new Blob([html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `TOMS-breakdown-${breakdown.job_number}.html`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    async function handleCopyForEmail() {
        const html = buildSingleBreakdownTableHTML(breakdown, { standalone: false });
        const plain = `Breakdown Report — ${breakdown.job_number}`;

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
                    <span className="report-detail-eyebrow">Vehicle Breakdown Report</span>
                    <h1>{breakdown.job_number}</h1>
                    <p className="report-detail-meta">
                        Submitted {formatDateTime(breakdown.created_at)}
                    </p>
                </div>

                <div className="report-detail-actions">
                    <span className={`status-badge status-${breakdown.status}`}>
                        {breakdown.status}
                    </span>

                    <button
                        type="button"
                        className="print-btn"
                        onClick={() => navigate(`/breakdowns/edit/${breakdown.id}`)}
                    >
                        <FiEdit2 />
                        Edit
                    </button>
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
                    <FiBriefcase />
                    Logistic Details
                </div>
                <div className="report-grid">
                    <ReportField label="Job Number" value={breakdown.job_number} />
                    <ReportField label="Vehicle Number" value={breakdown.vehicle_number} />
                    <ReportField label="Requesting Plant" value={breakdown.requesting_plant} fullWidth />
                </div>
            </div>

            <div className="report-section">
                <div className="report-section-title">
                    <FiNavigation />
                    Route Information
                </div>
                <div className="report-grid">
                    <ReportField label="Pickup Location" value={breakdown.pickup_location} />
                    <ReportField label="Via Location" value={breakdown.via_location} />
                    <ReportField label="Delivery Location" value={breakdown.delivery_location} fullWidth />
                </div>
            </div>

            <div className="report-section">
                <div className="report-section-title">
                    <FiAlertTriangle />
                    Incident Details
                </div>
                <div className="report-grid">
                    <ReportField label="Incident Type" value={breakdown.incident_type} />
                    <ReportField label="Incident Date & Time" value={breakdown.incident_datetime} />
                    <ReportField label="Breakdown/Accident Location" value={breakdown.location} />
                    <ReportField label="Reason / Description" value={breakdown.reason} fullWidth />
                </div>
            </div>

            {breakdown.image_filename && (
                <div className="report-section">
                    <div className="report-section-title">
                        <FiTruck />
                        Visual Evidence
                    </div>
                    <img
                        src={`/api/breakdowns/uploads/${breakdown.image_filename}`}
                        alt="Breakdown site"
                        className="breakdown-report-image"
                    />
                </div>
            )}

            <div className="report-section">
                <div className="report-section-title">
                    <FiCheckSquare />
                    Monitoring Center Action
                </div>
                <div className="report-grid">
                    <ReportField label="Action Taken / Resolution Notes" value={breakdown.action_taken} fullWidth />
                    <ReportField label="Priority" value={breakdown.priority} />
                </div>
            </div>

        </div>
    );
}

export default BreakdownReportDetail;