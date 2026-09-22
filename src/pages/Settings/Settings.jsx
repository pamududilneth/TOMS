import { useState, useEffect } from "react";
import "./Settings.css";

import UsersPanel from "../../components/UsersPanel/UsersPanel";
import Topbar from "../../components/Topbar/Topbar";
import SettingsTable from "../../components/SettingsTable/SettingsTable";
import BulkAddPanel from "../../components/BulkAddPanel/BulkAddPanel";
import { api } from "../../lib/api";

function Settings() {
    const [coordinators, setCoordinators] = useState([]);
    const [clients, setClients] = useState([]);
    const [stopCategories, setStopCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);

    function loadCoordinators() {
        api.listCoordinatorsFull().then(setCoordinators).catch(() => setCoordinators([]));
    }

    function loadClients() {
        api.listClientsFull().then(setClients).catch(() => setClients([]));
    }

    function loadStopCategories() {
        api.listStopCategoriesFull().then(setStopCategories).catch(() => setStopCategories([]));
    }

    function loadSuppliers() {
        api.listSuppliersFull().then(setSuppliers).catch(() => setSuppliers([]));
    }

    useEffect(() => {
        loadCoordinators();
        loadClients();
        loadStopCategories();
        loadSuppliers();
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
        await api.createClient({ name: values.name });
        loadClients();
    }

    async function handleDeleteClient(id) {
        await api.deleteClient(id);
        loadClients();
    }

    async function handleBulkAddClients(names) {
        const result = await api.bulkAddClients(names);
        loadClients();
        return result;
    }

    async function handleAddStopCategory(values) {
        await api.createStopCategory({ name: values.name });
        loadStopCategories();
    }

    async function handleDeleteStopCategory(id) {
        await api.deleteStopCategory(id);
        loadStopCategories();
    }

    async function handleAddSupplier(values) {
        await api.createSupplier({ name: values.name });
        loadSuppliers();
    }

    async function handleDeleteSupplier(id) {
        await api.deleteSupplier(id);
        loadSuppliers();
    }

    async function handleBulkAddSuppliers(names) {
        const result = await api.bulkAddSuppliers(names);
        loadSuppliers();
        return result;
    }

    return (
        <>
            <Topbar title="Settings" />

            <div className="settings-page">

                <UsersPanel />

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

                <BulkAddPanel onSubmit={handleBulkAddClients} label="customers" />
                <SettingsTable
                    title="Customers"
                    columns={[{ key: "name", label: "Name" }]}
                    rows={clients}
                    onAdd={handleAddClient}
                    onDelete={handleDeleteClient}
                    addFields={[{ key: "name", placeholder: "Customer name", required: true }]}
                />

                <SettingsTable
                    title="Vehicle Stop Categories"
                    columns={[{ key: "name", label: "Name" }]}
                    rows={stopCategories}
                    onAdd={handleAddStopCategory}
                    onDelete={handleDeleteStopCategory}
                    addFields={[{ key: "name", placeholder: "Category name", required: true }]}
                />

                <BulkAddPanel onSubmit={handleBulkAddSuppliers} label="suppliers" />
                <SettingsTable
                    title="Suppliers"
                    columns={[{ key: "name", label: "Name" }]}
                    rows={suppliers}
                    onAdd={handleAddSupplier}
                    onDelete={handleDeleteSupplier}
                    addFields={[{ key: "name", placeholder: "Supplier name", required: true }]}
                />

            </div>
        </>
    );
}

export default Settings;