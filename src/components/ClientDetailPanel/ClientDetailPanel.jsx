import "./ClientDetailPanel.css";
import { FiUser, FiMail, FiCheckCircle, FiFileText } from "react-icons/fi";

function formatDateTime(value) {
    if (!value) return "—";
    return new Date(value).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

function ClientDetailPanel({ client, loading, error }) {
    if (loading) {
        return <p className="client-detail-msg">Loading client...</p>;
    }

    if (error) {
        return <p className="client-detail-msg error">{error}</p>;
    }

    if (!client) {
        return (
            <div className="client-detail-empty">
                <FiUser size={28} />
                <p>Select a client from the list to view their details.</p>
            </div>
        );
    }

    return (
        <div className="client-detail">

            <div className="client-detail-header">
                <div className="client-detail-avatar">
                    {client.name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h1>{client.name}</h1>
                    <p className="client-detail-email">
                        <FiMail /> {client.email || "No email on file"}
                    </p>
                </div>
            </div>

            <div className="client-detail-status">
                <FiCheckCircle />
                {client.first_shared_at ? (
                    <span>
                        First shared on <strong>{formatDateTime(client.first_shared_at)}</strong> — reports have been kept up to date since.
                    </span>
                ) : (
                    <span>Not shared yet — this client hasn't been sent a report from Stop Management.</span>
                )}
            </div>

            <div className="client-detail-section">
                <div className="client-detail-section-title">
                    <FiFileText />
                    Shared Incident Reports ({client.incidents.length})
                </div>

                {client.incidents.length === 0 && (
                    <p className="client-detail-msg">No incidents have been shared with this client yet.</p>
                )}

                <div className="client-incident-list">
                    {client.incidents.map((incident) => (
                        <div className="client-incident-row" key={incident.id}>
                            <span className="client-incident-id">{incident.request_id}</span>
                            <span className="client-incident-vehicle">{incident.vehicle_number}</span>
                            <span className="client-incident-driver">{incident.driver_name}</span>
                            <span className={`status-badge status-${incident.status}`}>{incident.status}</span>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}

export default ClientDetailPanel;