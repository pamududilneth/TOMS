import { useState, useEffect, useMemo } from "react";
import "./Reports.css";

import Topbar from "../../components/Topbar/Topbar";
import ReportListItem from "../../components/ReportListItem/ReportListItem";
import ReportDetail from "../../components/ReportDetail/ReportDetail";
import { api } from "../../lib/api";
import { buildIncidentTableHTML } from "../../utils/reportTable";
import { FiSearch, FiRefreshCw, FiDownload, FiCopy } from "react-icons/fi";

function Reports() {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [selectedId, setSelectedId] = useState(null);
    const [copyStatus, setCopyStatus] = useState("");

    function loadIncidents() {
        setLoading(true);
        setError(null);
        api.listIncidents()
            .then((data) => {
                setIncidents(data);
                if (data.length > 0 && selectedId === null) {
                    setSelectedId(data[0].id);
                }
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }

    useEffect(() => {
        loadIncidents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return incidents;
        return incidents.filter((i) =>
            [i.request_id, i.vehicle_number, i.driver_name, i.client_name]
                .filter(Boolean)
                .some((field) => field.toLowerCase().includes(q))
        );
    }, [incidents, search]);

    const selectedIncident = incidents.find((i) => i.id === selectedId) || null;

    function handleDownloadHtml() {
        const html = buildIncidentTableHTML(filtered, { standalone: true });
        const blob = new Blob([html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `TOMS-incident-report-${new Date().toISOString().slice(0, 10)}.html`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    async function handleCopyForEmail() {
        const html = buildIncidentTableHTML(filtered, { standalone: false });
        const plain = filtered.map((i) => i.request_id).join(", ");

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
                                placeholder="Search request ID, vehicle, driver..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <button
                            type="button"
                            className="reports-refresh"
                            onClick={loadIncidents}
                            title="Refresh"
                        >
                            <FiRefreshCw />
                        </button>
                    </div>

                    <div className="reports-list-body">
                        {loading && <p className="reports-list-msg">Loading incidents...</p>}
                        {error && <p className="reports-list-msg error">{error}</p>}
                        {!loading && !error && filtered.length === 0 && (
                            <p className="reports-list-msg">No incidents found.</p>
                        )}
                        {filtered.map((incident) => (
                            <ReportListItem
                                key={incident.id}
                                incident={incident}
                                active={incident.id === selectedId}
                                onClick={() => setSelectedId(incident.id)}
                            />
                        ))}
                    </div>
                </div>

                <div className="reports-detail-panel">
                    <ReportDetail incident={selectedIncident} />
                </div>

            </div>
        </>
    );
}

export default Reports;