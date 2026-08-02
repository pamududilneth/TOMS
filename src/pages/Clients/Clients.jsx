import { useState, useEffect, useMemo } from "react";
import "./Clients.css";

import Topbar from "../../components/Topbar/Topbar";
import ClientListItem from "../../components/ClientListItem/ClientListItem";
import ClientDetailPanel from "../../components/ClientDetailPanel/ClientDetailPanel";
import { api } from "../../lib/api";
import { FiSearch, FiRefreshCw } from "react-icons/fi";

function Clients() {
    const [clients, setClients] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [selectedClient, setSelectedClient] = useState(null);

    const [listLoading, setListLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState(null);

    const [search, setSearch] = useState("");

    function loadClients() {
        setListLoading(true);
        api.listClientsFull()
            .then((data) => {
                setClients(data);
                if (data.length > 0 && selectedId === null) {
                    setSelectedId(data[0].id);
                }
            })
            .catch(() => setClients([]))
            .finally(() => setListLoading(false));
    }

    useEffect(() => {
        loadClients();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (selectedId === null) return;

        setDetailLoading(true);
        setDetailError(null);

        api.getClientDetail(selectedId)
            .then(setSelectedClient)
            .catch((err) => setDetailError(err.message))
            .finally(() => setDetailLoading(false));
    }, [selectedId]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return clients;
        return clients.filter((c) =>
            [c.name, c.email].filter(Boolean).some((f) => f.toLowerCase().includes(q))
        );
    }, [clients, search]);

    return (
        <>
            <Topbar title="Clients" />

            <div className="clients-layout">

                <div className="clients-list-panel">
                    <div className="clients-list-header">
                        <div className="clients-search">
                            <FiSearch />
                            <input
                                type="text"
                                placeholder="Search clients..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <button
                            type="button"
                            className="clients-refresh"
                            onClick={loadClients}
                            title="Refresh"
                        >
                            <FiRefreshCw />
                        </button>
                    </div>

                    <div className="clients-list-body">
                        {listLoading && <p className="client-detail-msg">Loading clients...</p>}
                        {!listLoading && filtered.length === 0 && (
                            <p className="client-detail-msg">
                                No clients found. Add some from the Settings page.
                            </p>
                        )}
                        {filtered.map((client) => (
                            <ClientListItem
                                key={client.id}
                                client={client}
                                active={client.id === selectedId}
                                onClick={() => setSelectedId(client.id)}
                            />
                        ))}
                    </div>
                </div>

                <div className="clients-detail-panel">
                    <ClientDetailPanel
                        client={selectedClient}
                        loading={detailLoading}
                        error={detailError}
                    />
                </div>

            </div>
        </>
    );
}

export default Clients;