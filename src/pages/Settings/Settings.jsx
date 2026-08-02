import { useState, useEffect } from "react";
import "./Settings.css";

import Topbar from "../../components/Topbar/Topbar";
import SettingsTable from "../../components/SettingsTable/SettingsTable";
import { api } from "../../lib/api";

function Settings() {
    const [coordinators, setCoordinators] = useState([]);
    const [clients, setClients] = useState([]);

    function loadCoordinators() {
        api.listCoordinatorsFull().then(setCoordinators).catch(() => setCoordinators([]));
    }

    function loadClients() {
        api.listClientsFull().then(setClients).catch(() => setClients([]));
    }

    useEffect(() => {
        loadCoordinators();
        loadClients();
    }, []);

    async function handleAddCoordinator(values) {
        await api.createCoordinator({
            name: values.name,
            mobile_number: values.mobile_number || null,
        });
        loadCoordinators();
    }

    async function handleDeleteCoordinator(id) {
        await api.deleteCoordinator(id);
        loadCoordinators();
    }

    async function handleAddClient(values) {
        await api.createClient({
            name: values.name,
            email: values.email || null,
        });
        loadClients();
    }

    async function handleDeleteClient(id) {
        await api.deleteClient(id);
        loadClients();
    }

    return (
        <>
            <Topbar title="Settings" />

            <div className="settings-page">

                <SettingsTable
                    title="Coordinators"
                    columns={[
                        { key: "name", label: "Name" },
                        { key: "mobile_number", label: "Mobile Number" },
                    ]}
                    rows={coordinators}
                    onAdd={handleAddCoordinator}
                    onDelete={handleDeleteCoordinator}
                    addFields={[
                        { key: "name", placeholder: "Coordinator name", required: true },
                        { key: "mobile_number", placeholder: "Mobile number (optional)" },
                    ]}
                />

                <SettingsTable
                    title="Clients"
                    columns={[
                        { key: "name", label: "Name" },
                        { key: "email", label: "Email" },
                    ]}
                    rows={clients}
                    onAdd={handleAddClient}
                    onDelete={handleDeleteClient}
                    addFields={[
                        { key: "name", placeholder: "Client name", required: true },
                        { key: "email", placeholder: "Email (for report sharing)", type: "email" },
                    ]}
                />

            </div>
        </>
    );
}

export default Settings;