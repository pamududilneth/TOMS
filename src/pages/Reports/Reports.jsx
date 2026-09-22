import { useState, useEffect, useMemo } from "react";
import "./Reports.css";

import Topbar from "../../components/Topbar/Topbar";
import ReportTypeToggle from "../../components/ReportTypeToggle/ReportTypeToggle";
import ReportListItem from "../../components/ReportListItem/ReportListItem";
import ReportDetail from "../../components/ReportDetail/ReportDetail";
import BreakdownListItem from "../../components/BreakdownListItem/BreakdownListItem";
import BreakdownReportDetail from "../../components/BreakdownReportDetail/BreakdownReportDetail";
import { api } from "../../lib/api";
// import { buildIncidentTableHTML, buildBreakdownTableHTML } from "../../utils/reportTable";
import { FiSearch, FiRefreshCw, FiDownload, FiCopy } from "react-icons/fi";

function Reports() {
    const [reportType, setReportType] = useState("incidents"); // "incidents" | "breakdowns"

    const [incidents, setIncidents] = useState([]);
    const [breakdowns, setBreakdowns] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [selectedId, setSelectedId] = useState(null);
    const [copyStatus, setCopyStatus] = useState("");

    function loadData(type) {
        setLoading(true);
        setError(null);
        setSelectedId(null);

        const call = type === "incidents" ? api.listIncidents() : api.listBreakdowns();

        call
            .then((data) => {
                if (type === "incidents") {
                    setIncidents(data);
                } else {
                    setBreakdowns(data);
                }
                if (data.length > 0) {
                    setSelectedId(data[0].id);
                }
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }

    useEffect(() => {
        loadData(reportType);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reportType]);

    const records = reportType === "incidents" ? incidents : breakdowns;

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return records;

        if (reportType === "incidents") {
            return records.filter((i) =>
                [i.request_id, i.vehicle_number, i.driver_name, i.client_name]
                    .filter(Boolean)
                    .some((field) => field.toLowerCase().includes(q))
            );
        }

        return records.filter((b) =>
            [b.job_number, b.vehicle_number, b.requesting_plant, b.incident_type]
                .filter(Boolean)
                .some((field) => field.toLowerCase().includes(q))
        );
    }, [records, search, reportType]);

    const selectedRecord = records.find((r) => r.id === selectedId) || null;

    function handleDownloadHtml() {
        const html =
            reportType === "incidents"
                ? buildIncidentTableHTML(filtered, { standalone: true })
                : buildBreakdownTableHTML(filtered, { standalone: true });

        const blob = new Blob([html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `TOMS-${reportType}-report-${new Date().toISOString().slice(0, 10)}.html`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    async function handleCopyForEmail() {
        const html =
            reportType === "incidents"
                ? buildIncidentTableHTML(filtered, { standalone: false })
                : buildBreakdownTableHTML(filtered, { standalone: false });

        const plain = `${filtered.length} ${reportType} record(s)`;

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
            setCopyStatus("Copy failed — try the Download button instead.");
        }

        setTimeout(() => setCopyStatus(""), 3500);
    }

    return (
        <>
            <Topbar title="Reports" />

            <div className="reports-toolbar">
                <ReportTypeToggle value={reportType} onChange={setReportType} />

                <div className="reports-toolbar-spacer" />

                <button type="button" className="reports-export-btn" onClick={handleDownloadHtml}>
                    <FiDownload />
                    Download as HTML
                </button>
                <button type="button" className="reports-export-btn" onClick={handleCopyForEmail}>
                    <FiCopy />
                    Copy Table for Email
                </button>
                {copyStatus && <span className="reports-copy-status">{copyStatus}</span>}
            </div>

            <div className="reports-layout">

                <div className="reports-list-panel">
                    <div className="reports-list-header">
                        <div className="reports-search">
                            <FiSearch />
                            <input
                                type="text"
                                placeholder={
                                    reportType === "incidents"
                                        ? "Search request ID, vehicle, driver..."
                                        : "Search job number, vehicle, plant..."
                                }
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <button
                            type="button"
                            className="reports-refresh"
                            onClick={() => loadData(reportType)}
                            title="Refresh"
                        >
                            <FiRefreshCw />
                        </button>
                    </div>

                    <div className="reports-list-body">
                        {loading && <p className="reports-list-msg">Loading...</p>}
                        {error && <p className="reports-list-msg error">{error}</p>}
                        {!loading && !error && filtered.length === 0 && (
                            <p className="reports-list-msg">No records found.</p>
                        )}

                        {reportType === "incidents"
                            ? filtered.map((incident) => (
                                <ReportListItem
                                    key={incident.id}
                                    incident={incident}
                                    active={incident.id === selectedId}
                                    onClick={() => setSelectedId(incident.id)}
                                />
                            ))
                            : filtered.map((breakdown) => (
                                <BreakdownListItem
                                    key={breakdown.id}
                                    breakdown={breakdown}
                                    active={breakdown.id === selectedId}
                                    onClick={() => setSelectedId(breakdown.id)}
                                />
                            ))}
                    </div>
                </div>

                <div className="reports-detail-panel">
                    {reportType === "incidents" ? (
                        <ReportDetail
                            incident={selectedRecord}
                            onDeleted={() => {
                                setSelectedId(null);
                                loadData(reportType);
                            }}
                        />
                    ) : (
                        <BreakdownReportDetail
                            breakdown={selectedRecord}
                            onDeleted={() => {
                                setSelectedId(null);
                                loadData(reportType);
                            }}
                        />
                    )}
                </div>

            </div>
        </>
    );
}

export default Reports;