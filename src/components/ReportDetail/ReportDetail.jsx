// import { useState, useEffect } from "react";
// import "./ReportDetail.css";
// import ReportField from "../ReportField/ReportField";
// import { buildSingleIncidentTableHTML } from "../../utils/reportTable";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";
// import { api } from "../../lib/api";
// import { copyIncidentTableToClipboard } from "../../utils/clipboardCopy";

// import { FiPrinter, FiDownload, FiCopy, FiEdit2, FiTrash2, FiAlertTriangle, FiUser, FiMapPin, FiFileText, FiCheckCircle } from "react-icons/fi";

// function formatDateTime(value) {
//     if (!value) return "—";
//     const date = new Date(value);
//     return date.toLocaleString(undefined, {
//         dateStyle: "medium",
//         timeStyle: "short",
//     });
// }

// function ReportDetail({ incident, onDeleted }) {
//     const [copyStatus, setCopyStatus] = useState("");
//     const [customerName, setCustomerName] = useState("");
//     const navigate = useNavigate();
//     const { user } = useAuth();

//     useEffect(() => {
//         if (!incident?.customer_id) {
//             setCustomerName("");
//             return;
//         }
//         api.listClientsFull()
//             .then((clients) => {
//                 const match = clients.find((c) => c.id === incident.customer_id);
//                 setCustomerName(match?.name || "");
//             })
//             .catch(() => setCustomerName(""));
//     }, [incident?.customer_id]);

//     if (!incident) {
//         return (
//             <div className="report-detail-empty">
//                 <FiFileText size={28} />
//                 <p>Select an incident from the list to view its full report.</p>
//             </div>
//         );
//     }

//     function handleDownloadHtml() {
//         const html = buildSingleIncidentTableHTML(incident, { standalone: true });
//         const blob = new Blob([html], { type: "text/html" });
//         const url = URL.createObjectURL(blob);
//         const a = document.createElement("a");
//         a.href = url;
//         a.download = `TOMS-incident-${incident.request_id}.html`;
//         document.body.appendChild(a);
//         a.click();
//         a.remove();
//         URL.revokeObjectURL(url);
//     }

//     async function handleCopyForEmail() {
//         try {
//             await copyIncidentTableToClipboard(incident);
//             setCopyStatus("Copied! Paste into your Outlook email.");
//         } catch (err) {
//             console.error("[copy] Clipboard write failed:", err);
//             setCopyStatus("Copy failed — try again.");
//         }
//         setTimeout(() => setCopyStatus(""), 3500);
//     }

//     async function handleDelete() {
//         const confirmed = window.confirm(
//             `Delete incident ${incident.request_id}? This cannot be undone.`
//         );
//         if (!confirmed) return;

//         try {
//             await api.deleteIncident(incident.id);
//             onDeleted?.();
//         } catch (err) {
//             alert(err.message);
//         }
//     }

//     return (
//         <div className="report-detail" id="report-print-area">

//             <div className="report-detail-header">
//                 <div>
//                     <span className="report-detail-eyebrow">Incident Report</span>
//                     <h1>{incident.request_id}</h1>
//                     <p className="report-detail-meta">
//                         Submitted {formatDateTime(incident.created_at)}
//                     </p>
//                 </div>

//                 <div className="report-detail-actions">
//                     <span className={`status-badge status-${incident.status}`}>
//                         {incident.status}
//                     </span>
//                     <button
//                         type="button"
//                         className="print-btn"
//                         onClick={() => navigate(`/stop-management/edit/${incident.id}`)}
//                     >
//                         <FiEdit2 />
//                         Edit
//                     </button>
//                     {user?.role === "admin" && (
//                         <button type="button" className="print-btn btn-danger" onClick={handleDelete}>
//                             <FiTrash2 />
//                             Delete
//                         </button>
//                     )}
//                     <button type="button" className="print-btn" onClick={handleDownloadHtml}>
//                         <FiDownload />
//                         Download as HTML
//                     </button>
//                     <button type="button" className="print-btn" onClick={handleCopyForEmail}>
//                         <FiCopy />
//                         Copy Table for Email
//                     </button>
//                     <button type="button" className="print-btn" onClick={() => window.print()}>
//                         <FiPrinter />
//                         Print / Save as PDF
//                     </button>
//                 </div>
//             </div>

//             {copyStatus && <p className="report-copy-status">{copyStatus}</p>}

//             <div className="report-section">
//                 <div className="report-section-title">
//                     <FiAlertTriangle />
//                     Job & Customer
//                 </div>
//                 <div className="report-grid">
//                     <ReportField label="Key" value={incident.request_id} />
//                     <ReportField label="Job No" value={incident.job_no} />
//                     <ReportField label="Customer" value={customerName} />
//                     <ReportField label="Vehicle Stop Category" value={incident.stop_category} />
//                 </div>
//             </div>

//             <div className="report-section">
//                 <div className="report-section-title">
//                     <FiUser />
//                     Personnel Details
//                 </div>
//                 <div className="report-grid">
//                     <ReportField label="Vehicle No" value={incident.vehicle_number} />
//                     <ReportField label="Driver Name" value={incident.driver_name} />
//                     <ReportField label="Driver Contact No" value={incident.driver_contact_number} />
//                     <ReportField label="Vehicle Assigned by (Coordinator Name)" value={incident.assigned_coordinator} />
//                     <ReportField label="Coordinator Mobile No" value={incident.coordinator_mobile_number} />
//                 </div>
//             </div>

//             <div className="report-section">
//                 <div className="report-section-title">
//                     <FiMapPin />
//                     Stop Details
//                 </div>
//                 <div className="report-grid">
//                     <ReportField label="Vehicle Stopped Location" value={incident.current_parking_location} />
//                     <ReportField label="Vehicle Stopped Date" value={incident.stopped_date} />
//                     <ReportField label="Vehicle Stopped Time" value={incident.stopped_time} />
//                     <ReportField label="Duration" value={incident.duration} />
//                     <ReportField label="Pickup Location" value={incident.pickup_location} />
//                     <ReportField label="Via Location/s" value={incident.via_locations} />
//                     <ReportField label="Delivery Location" value={incident.delivery_location} />
//                 </div>
//             </div>

//             <div className="report-section">
//                 <div className="report-section-title">
//                     <FiCheckCircle />
//                     Status & Feedback
//                 </div>
//                 <div className="report-grid">
//                     <ReportField label="Driver Contacted by OKI DOKI" value={incident.driver_contacted} />
//                     <ReportField label="Vehicle Parking with Goods" value={incident.vehicle_parked ? "Yes" : "No"} />
//                     <ReportField label="Driver Feedback - If Contacted" value={incident.driver_feedback} fullWidth />
//                 </div>
//             </div>

//         </div>
//     );
// }

// export default ReportDetail;  


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
                    Job & Customer
                </div>
                <div className="report-grid">
                    <ReportField label="Key" value={incident.request_id} />
                    <ReportField label="Job No" value={incident.job_no} />
                    <ReportField label="Customer" value={incident.customer_name} />
                    <ReportField label="Vehicle Stop Category" value={incident.stop_category} />
                </div>
            </div>

            <div className="report-section">
                <div className="report-section-title">
                    <FiUser />
                    Personnel Details
                </div>
                <div className="report-grid">
                    <ReportField label="Vehicle No" value={incident.vehicle_number} />
                    <ReportField label="Driver Name" value={incident.driver_name} />
                    <ReportField label="Driver Contact No" value={incident.driver_contact_number} />
                    <ReportField label="Vehicle Assigned by (Coordinator Name)" value={incident.assigned_coordinator} />
                    <ReportField label="Coordinator Mobile No" value={incident.coordinator_mobile_number} />
                </div>
            </div>

            <div className="report-section">
                <div className="report-section-title">
                    <FiMapPin />
                    Stop Details
                </div>
                <div className="report-grid">
                    <ReportField label="Vehicle Stopped Location" value={incident.current_parking_location} />
                    <ReportField label="Vehicle Stopped Date" value={incident.stopped_date} />
                    <ReportField label="Vehicle Stopped Time" value={incident.stopped_time} />
                    <ReportField label="Duration" value={incident.duration} />
                    <ReportField label="Pickup Location" value={incident.pickup_location} />
                    <ReportField label="Via Location/s" value={incident.via_locations} />
                    <ReportField label="Delivery Location" value={incident.delivery_location} />
                </div>
            </div>

            <div className="report-section">
                <div className="report-section-title">
                    <FiCheckCircle />
                    Status & Feedback
                </div>
                <div className="report-grid">
                    <ReportField label="Driver Contacted by OKI DOKI" value={incident.driver_contacted} />
                    <ReportField label="Vehicle Parking with Goods" value={incident.vehicle_parked ? "Yes" : "No"} />
                    <ReportField label="Driver Feedback - If Contacted" value={incident.driver_feedback} fullWidth />
                </div>
            </div>

        </div>
    );
}

export default ReportDetail;