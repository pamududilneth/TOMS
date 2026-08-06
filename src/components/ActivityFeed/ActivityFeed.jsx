import "./ActivityFeed.css";
import { FiAlertTriangle, FiTruck, FiClock } from "react-icons/fi";

function timeAgo(isoString) {
    if (!isoString) return "—";
    const then = new Date(isoString).getTime();
    const diffSec = Math.max(0, Math.floor((Date.now() - then) / 1000));

    if (diffSec < 60) return "just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} hr ago`;
    return `${Math.floor(diffHr / 24)}d ago`;
}

function ActivityFeed({ items }) {
    return (
        <div className="activity-feed">
            <div className="activity-feed-header">
                <FiClock />
                <h3>Recent Activity</h3>
            </div>

            <div className="activity-feed-list">
                {items.length === 0 && (
                    <p className="activity-feed-empty">
                        No activity yet — submitted incidents and breakdowns will appear here.
                    </p>
                )}

                {items.map((item) => (
                    <div key={`${item.type}-${item.id}`} className="activity-feed-item">
                        <span className={`activity-feed-icon icon-${item.type}`}>
                            {item.type === "incident" ? <FiAlertTriangle /> : <FiTruck />}
                        </span>

                        <div className="activity-feed-body">
                            <div className="activity-feed-top">
                                <span className="activity-feed-title">{item.title}</span>
                                <span className="activity-feed-time">{timeAgo(item.created_at)}</span>
                            </div>
                            <span className="activity-feed-subtitle">
                                {item.reference}
                                {item.subtitle ? ` · ${item.subtitle}` : ""}
                            </span>
                        </div>

                        <span className={`status-badge status-${item.status}`}>{item.status}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ActivityFeed;