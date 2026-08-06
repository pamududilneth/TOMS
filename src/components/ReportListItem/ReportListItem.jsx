import "./ReportListItem.css";

function formatDate(value) {
    if (!value) return "—";
    return new Date(value).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function ReportListItem({ incident, active, onClick }) {
    return (
        <button
            type="button"
            className={`report-list-item ${active ? "active" : ""}`}
            onClick={onClick}
        >
            <div className="report-list-item-top">
                <span className="report-list-item-id">{incident.request_id}</span>
                <span className={`status-dot status-dot-${incident.status}`} />
            </div>
            <span className="report-list-item-vehicle">{incident.vehicle_number}</span>
            <span className="report-list-item-driver">{incident.driver_name}</span>
            <span className="report-list-item-date">{formatDate(incident.created_at)}</span>
        </button>
    );
}

export default ReportListItem;