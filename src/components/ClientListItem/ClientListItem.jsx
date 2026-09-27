import "./ClientListItem.css";

function ClientListItem({ client, active, onClick }) {
    return (
        <button
            type="button"
            className={`client-list-item ${active ? "active" : ""}`}
            onClick={onClick}

        >
            {client.first_shared_at ? (
                <a
                    href={client.share_link}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="client-share-badge shared"
                >
                    View live sheet
                </a>
            ) : (
                <span className="client-share-status pending">Not shared yet</span>
            )}
            <span className="client-list-item-name">{client.name}</span>
            <span className="client-list-item-email">{client.email || "No email set"}</span>
            {client.first_shared_at ? (
                <span className="client-share-status shared">Shared</span>
            ) : (
                <span className="client-share-status pending">Not shared yet</span>
            )}
        </button>
    );
}

export default ClientListItem;