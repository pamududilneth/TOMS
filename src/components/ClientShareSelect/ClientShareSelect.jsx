import "./ClientShareSelect.css";

function ClientShareSelect({ clients, selectedIds, onChange }) {
    function toggle(id) {
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter((i) => i !== id));
        } else {
            onChange([...selectedIds, id]);
        }
    }

    return (
        <div className="client-share-select">
            <label>Share With Customer(s)</label>
            <div className="client-share-list">
                {clients.length === 0 && (
                    <p className="client-share-empty">No customers found yet.</p>
                )}
                {clients.map((client) => (
                    <label key={client.id} className="client-share-item">
                        <input
                            type="checkbox"
                            checked={selectedIds.includes(client.id)}
                            onChange={() => toggle(client.id)}
                        />
                        <span className="client-share-name">{client.name}</span>
                        {client.first_shared_at ? (
                            <a /* 👈 THE MISSING TAG WAS ADDED HERE */
                                href={client.share_link}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="client-share-badge shared"
                            >
                                View live sheet
                            </a>
                        ) : client.email ? (
                            <span className="client-share-badge pending">Will email link first time</span>
                        ) : (
                            <span className="client-share-badge no-email">No email set</span>
                        )}
                    </label>
                ))}
            </div>
        </div>
    );
}

export default ClientShareSelect;