import { useState } from "react";
import "./BreakdownReportDetail.css";
import ReportField from "../ReportField/ReportField";
import { buildSingleBreakdownTableHTML } from "../../utils/reportTable";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { FiPrinter, FiDownload, FiCopy, FiEdit2, FiTrash2, FiBriefcase, FiAlertTriangle, FiCheckSquare, FiTruck } from "react-icons/fi";

function formatDateTime(value) {
    if (!value) return "—";
    return new Date(value).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

function BreakdownReportDetail({ breakdown, onDeleted }) {
    const [copyStatus, setCopyStatus] = useState("");
    const navigate = useNavigate();
    const { user } = useAuth();

    if (!breakdown) {
        return (
            <div className="report-detail-empty">
                <FiTruck size={28} />
                <p>Select a breakdown from the list to view its full report.</p>
            </div>
        );
    }

    async function handleDownloadHtml() {
        const html = buildSingleBreakdownTableHTML(breakdown, {
            standalone: true,
        });

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
        } catch (err) {
            console.error("[copy] Clipboard write failed:", err);
            setCopyStatus("Copy failed — try again.");
        }
        setTimeout(() => setCopyStatus(""), 4000);
    }

    async function handleDelete() {
        const confirmed = window.confirm(
            `Delete breakdown ${breakdown.job_number}? This cannot be undone.`
        );
        if (!confirmed) return;

        try {
            await api.deleteBreakdown(breakdown.id);
            onDeleted?.();
        } catch (err) {
            alert(err.message);
        }
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
                <div className="report-section-title"><FiBriefcase />Job Details</div>
                <div className="report-grid">
                    <ReportField label="Record ID" value={breakdown.job_number} />
                    <ReportField label="Job No" value={breakdown.job_no} />
                    <ReportField label="Incident Date/Time" value={breakdown.incident_datetime} />
                    <ReportField label="Incident Month" value={breakdown.incident_month} />
                    <ReportField label="Data Entered by" value={breakdown.owner_name} />
                    <ReportField label="Reported Month" value={breakdown.reported_month} />
                    <ReportField label="Time for Reporting" value={breakdown.time_for_reporting} />
                    <ReportField label="Customer" value={breakdown.customer_name} />
                    <ReportField label="Vehicle No" value={breakdown.vehicle_number} />
                    <ReportField label="Vehicle Type" value={breakdown.vehicle_type} />
                    <ReportField label="Driver" value={breakdown.driver} />
                    <ReportField label="Supplier" value={breakdown.supplier_name} />
                </div>
            </div>

            <div className="report-section">
                <div className="report-section-title"><FiAlertTriangle />Category</div>
                <div className="report-grid">
                    <ReportField label="Category" value={breakdown.category} />
                    <ReportField label="Injury Category" value={breakdown.injury_category} />
                    <ReportField label="Category Detail" value={breakdown.category_detail} fullWidth />
                </div>
            </div>

            <div className="report-section">
                <div className="report-section-title"><FiCheckSquare />Impact Assessment</div>
                <div className="report-grid">
                    <ReportField label="Route Cause" value={breakdown.root_cause} />
                    <ReportField label="Shipment Content (Goods)" value={breakdown.shipment_content} />
                    <ReportField label="Third Party Life" value={breakdown.third_party_life} />
                    <ReportField label="Driver/Assistant Life" value={breakdown.driver_assistant_life} />
                    <ReportField label="Vehicle" value={breakdown.vehicle_impact} />
                    <ReportField label="Third Party Property" value={breakdown.third_party_property} />
                    <ReportField label="Delivery on Time" value={breakdown.delivery_on_time} />
                    <ReportField label="Involvement of Police" value={breakdown.involvement_of_police} />
                    <ReportField label="Legal Impact" value={breakdown.legal_impact} />
                </div>
            </div>

        </div>
    );
}

export default BreakdownReportDetail;