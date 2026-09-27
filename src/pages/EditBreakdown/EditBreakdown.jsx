import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../IncidentEntry/IncidentEntry.css";

import Topbar from "../../components/Topbar/Topbar";
import PageToolbar from "../../components/PageToolbar/PageToolbar";
import FormSection from "../../components/FormSection/FormSection";
import FormField from "../../components/FormField/FormField";
import SearchableSelect from "../../components/SearchableSelect/SearchableSelect";
import { api } from "../../lib/api";

import { FiAlertTriangle, FiBriefcase, FiUsers } from "react-icons/fi";

const CATEGORY_OPTIONS = ["Accident", "Incident", "Breakdown", "Investigation", "Police Checking"];
const INJURY_OPTIONS = ["No injury", "First-aid", "Hospital treatment", "Disability-Temporary", "Disability-Permanent", "Fatal"];
const ROOT_CAUSE_OPTIONS = ["Driver issue", "Peak time", "Road condition", "Third party issue", "Traffic", "Vehicle issue", "Weather condition"];
const AFFECTED_OPTIONS = ["Affected", "Not affected"];
const VEHICLE_OPTIONS = ["Affected", "Not affected", "Need a backup team /vehicle"];
const DELIVERY_OPTIONS = ["Can meet", "Cannot meet"];
const YES_NO_OPTIONS = ["Yes", "No"];
const STATUS_OPTIONS = ["submitted", "in_progress", "resolved"];
const VEHICLE_TYPE_OPTIONS = [
    "10.5' - FLAT PACK", "12.5' - FLAT PACK", "14.5' - FLAT PACK", "14.5 FT REEFER",
    "16.5' - FLAT PACK", "18.5' - FLAT PACK", "18.5 FT - CAGE", "20' - FLAT PACK",
    "20 FEET REEFER", "22 FT - CAGE", "40' - FLAT PACK", "45' - FLAT PACK",
    "7.5' - FLAT PACK", "8.5' - FLAT PACK", "CAR", "MOTOR BIKE", "THREE WHEEL", "VAN",
];

function validateJobNo(value) {
    if (!value) return null;
    const prefix = value.slice(0, 3);
    const isValidPrefix = /^[A-Z]{3}$/.test(prefix);
    const isValidLength = value.length === 11 || value.length === 13;
    if (!isValidPrefix || !isValidLength) return "Incorrect job number";
    return null;
}

function EditBreakdown() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState(null);
    const [clients, setClients] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [jobNoError, setJobNoError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.getBreakdown(id)
            .then((data) => {
                setForm(data);
                setJobNoError(validateJobNo(data.job_no || ""));
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));

        api.listClientsFull().then(setClients).catch(() => setClients([]));
        api.listSuppliersFull().then(setSuppliers).catch(() => setSuppliers([]));
    }, [id]);

    function updateField(name, value) {
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    async function handleSubmit() {
        const validationError = validateJobNo(form.job_no);
        if (validationError) {
            setJobNoError(validationError);
            setError("Please fix the Job No before saving.");
            return;
        }

        setSubmitting(true);
        setError(null);
        try {
            await api.updateBreakdown(id, {
                incident_datetime: form.incident_datetime,
                job_no: form.job_no,
                customer_id: form.customer_id ? Number(form.customer_id) : null,
                vehicle_number: form.vehicle_number,
                vehicle_type: form.vehicle_type,
                driver: form.driver,
                supplier_id: form.supplier_id ? Number(form.supplier_id) : null,
                category: form.category,
                category_detail: form.category_detail,
                injury_category: form.injury_category,
                root_cause: form.root_cause,
                shipment_content: form.shipment_content,
                third_party_life: form.third_party_life,
                driver_assistant_life: form.driver_assistant_life,
                vehicle_impact: form.vehicle_impact,
                third_party_property: form.third_party_property,
                delivery_on_time: form.delivery_on_time,
                involvement_of_police: form.involvement_of_police,
                legal_impact: form.legal_impact,
                status: form.status,
            });
            navigate("/reports");
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <>
                <Topbar title="Operations Dashboard" />
                <p className="form-error" style={{ background: "transparent", color: "var(--text-muted)" }}>
                    Loading breakdown...
                </p>
            </>
        );
    }

    if (error && !form) {
        return (
            <>
                <Topbar title="Operations Dashboard" />
                <p className="form-error">{error}</p>
            </>
        );
    }

    const isAccident = form.category === "Accident";

    return (
        <>
            <Topbar title="Operations Dashboard" />

            <PageToolbar
                crumbs={["Operational Control", "Breakdowns/Accident", form.job_number]}
                subtitle="Edit Breakdown/Accident"
                onDiscard={() => navigate("/reports")}
                onSubmit={handleSubmit}
                submitting={submitting}
                discardLabel="Cancel"
                submitLabel="Save Changes"
                submittingLabel="Saving..."
            />

            {error && <p className="form-error">{error}</p>}

            <div className="incident-entry-stack">

                <FormSection icon={<FiBriefcase />} iconColor="blue" title="Job Details">
                    <div className="form-row">
                        <FormField label="Record ID" value={form.job_number} readOnly />
                        <FormField
                            label="Job No"
                            value={form.job_no || ""}
                            onChange={(e) => {
                                const value = e.target.value.toUpperCase();
                                updateField("job_no", value);
                                setJobNoError(validateJobNo(value));
                            }}
                            helper={jobNoError || "e.g. BRL0000077978 or CFC00091139"}
                            helperError={!!jobNoError}
                        />
                        <FormField
                            label="Incident Date/Time"
                            type="datetime-local"
                            value={form.incident_datetime || ""}
                            onChange={(e) => updateField("incident_datetime", e.target.value)}
                        />
                    </div>
                    <div className="form-row">
                        <SearchableSelect
                            label="Customer"
                            placeholder="Select customer"
                            options={clients.map((c) => c.name)}
                            value={clients.find((c) => c.id === Number(form.customer_id))?.name || ""}
                            onChange={(name) => {
                                const match = clients.find((c) => c.name === name);
                                updateField("customer_id", match ? match.id : "");
                            }}
                        />
                        <FormField
                            label="Vehicle No"
                            required
                            value={form.vehicle_number || ""}
                            onChange={(e) => updateField("vehicle_number", e.target.value)}
                        />
                        <SearchableSelect
                            label="Vehicle Type"
                            placeholder="Select vehicle type"
                            options={VEHICLE_TYPE_OPTIONS}
                            value={form.vehicle_type || ""}
                            onChange={(val) => updateField("vehicle_type", val)}
                        />
                        <FormField
                            label="Driver"
                            value={form.driver || ""}
                            onChange={(e) => updateField("driver", e.target.value)}
                        />
                    </div>
                </FormSection>

                <FormSection icon={<FiUsers />} iconColor="violet" title="Supplier & Category">
                    <div className="form-row">
                        <SearchableSelect
                            label="Supplier"
                            placeholder="Select supplier"
                            options={suppliers.map((s) => s.name)}
                            value={suppliers.find((s) => s.id === Number(form.supplier_id))?.name || ""}
                            onChange={(name) => {
                                const match = suppliers.find((s) => s.name === name);
                                updateField("supplier_id", match ? match.id : "");
                            }}
                        />
                        <SearchableSelect
                            label="Category"
                            placeholder="Select category"
                            options={CATEGORY_OPTIONS}
                            value={form.category || ""}
                            onChange={(val) => updateField("category", val)}
                        />
                        {isAccident && (
                            <SearchableSelect
                                label="Injury Category"
                                placeholder="Select injury category"
                                options={INJURY_OPTIONS}
                                value={form.injury_category || ""}
                                onChange={(val) => updateField("injury_category", val)}
                            />
                        )}
                    </div>
                    <FormField
                        label="Category Detail"
                        type="textarea"
                        value={form.category_detail || ""}
                        onChange={(e) => updateField("category_detail", e.target.value)}
                    />
                </FormSection>

                <FormSection icon={<FiAlertTriangle />} iconColor="red" title="Impact Assessment">
                    <div className="form-row">
                        <SearchableSelect
                            label="Route Cause"
                            options={ROOT_CAUSE_OPTIONS}
                            value={form.root_cause || ""}
                            onChange={(val) => updateField("root_cause", val)}
                        />
                        <SearchableSelect
                            label="Shipment Content (Goods)"
                            options={AFFECTED_OPTIONS}
                            value={form.shipment_content || ""}
                            onChange={(val) => updateField("shipment_content", val)}
                        />
                        <SearchableSelect
                            label="Third Party Life"
                            options={AFFECTED_OPTIONS}
                            value={form.third_party_life || ""}
                            onChange={(val) => updateField("third_party_life", val)}
                        />
                        <SearchableSelect
                            label="Driver/Assistant Life"
                            options={AFFECTED_OPTIONS}
                            value={form.driver_assistant_life || ""}
                            onChange={(val) => updateField("driver_assistant_life", val)}
                        />
                    </div>
                    <div className="form-row">
                        <SearchableSelect
                            label="Vehicle"
                            options={VEHICLE_OPTIONS}
                            value={form.vehicle_impact || ""}
                            onChange={(val) => updateField("vehicle_impact", val)}
                        />
                        <SearchableSelect
                            label="Third Party Property"
                            options={AFFECTED_OPTIONS}
                            value={form.third_party_property || ""}
                            onChange={(val) => updateField("third_party_property", val)}
                        />
                        <SearchableSelect
                            label="Delivery on Time"
                            options={DELIVERY_OPTIONS}
                            value={form.delivery_on_time || ""}
                            onChange={(val) => updateField("delivery_on_time", val)}
                        />
                        <SearchableSelect
                            label="Involvement of Police"
                            options={YES_NO_OPTIONS}
                            value={form.involvement_of_police || ""}
                            onChange={(val) => updateField("involvement_of_police", val)}
                        />
                        <SearchableSelect
                            label="Legal Impact"
                            options={YES_NO_OPTIONS}
                            value={form.legal_impact || ""}
                            onChange={(val) => updateField("legal_impact", val)}
                        />
                    </div>
                </FormSection>

                <FormSection icon={<FiBriefcase />} iconColor="green" title="Status">
                    <FormField
                        label="Status"
                        type="select"
                        placeholder="Select status"
                        options={STATUS_OPTIONS}
                        value={form.status}
                        onChange={(e) => updateField("status", e.target.value)}
                    />
                </FormSection>

            </div>
        </>
    );
}

export default EditBreakdown;