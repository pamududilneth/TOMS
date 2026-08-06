import "./BreakdownListItem.css";

function formatDate(value) {
    if (!value) return "—";
    return new Date(value).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function BreakdownListItem({ breakdown, active, onClick }) {
    return (
        <button
            type="button"
            className={`breakdown-list-item ${active ? "active" : ""}`}
            onClick={onClick}
        >
            <div className="breakdown-list-item-top">
                <span className="breakdown-list-item-id">{breakdown.job_number}</span>
                <span className={`incident-type-badge type-${breakdown.incident_type.toLowerCase()}`}>
                    {breakdown.incident_type}
                </span>
            </div>
            <span className="breakdown-list-item-vehicle">{breakdown.vehicle_number}</span>
            <span className="breakdown-list-item-date">{formatDate(breakdown.created_at)}</span>
        </button>
    );
}

export default BreakdownListItem;