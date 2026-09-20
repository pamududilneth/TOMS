import { useState, useEffect, useRef } from "react";
import "./Breakdowns.css";

import Topbar from "../../components/Topbar/Topbar";
import PageToolbar from "../../components/PageToolbar/PageToolbar";
import FormSection from "../../components/FormSection/FormSection";
import FormField from "../../components/FormField/FormField";
import SearchableSelect from "../../components/SearchableSelect/SearchableSelect";
import BreakdownSuccessModal from "../../components/BreakdownSuccessModal/BreakdownSuccessModal";
import { api } from "../../lib/api";
import { useBreakdownDraft } from "../../context/BreakdownDraftContext";

import { FiAlertTriangle, FiBriefcase, FiUsers } from "react-icons/fi";

const CATEGORY_OPTIONS = ["Accident", "Incident", "Breakdown", "Investigation", "Police Checking"];
const INJURY_OPTIONS = ["No injury", "First-aid", "Hospital treatment", "Disability-Temporary", "Disability-Permanent", "Fatal"];
const ROOT_CAUSE_OPTIONS = ["Driver issue", "Peak time", "Road condition", "Third party issue", "Traffic", "Vehicle issue", "Weather condition"];
const AFFECTED_OPTIONS = ["Affected", "Not affected"];
const VEHICLE_OPTIONS = ["Affected", "Not affected", "Need a backup team /vehicle"];
const DELIVERY_OPTIONS = ["Can meet", "Cannot meet"];
const YES_NO_OPTIONS = ["Yes", "No"];

function validateJobNo(value) {
    if (!value) return null;
    const prefix = value.slice(0, 3);
    const isValidPrefix = /^[A-Z]{3}$/.test(prefix);
    const isValidLength = value.length === 11 || value.length === 13;
    if (!isValidPrefix || !isValidLength) return "Incorrect job number";
    return null;
}

function Breakdowns() {
    const { form, setForm, resetForm } = useBreakdownDraft();

    const [previewId, setPreviewId] = useState("Generating...");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [jobNoError, setJobNoError] = useState(() => validateJobNo(form.job_no));
    const [submittedBreakdown, setSubmittedBreakdown] = useState(null);

    const [clients, setClients] = useState([]);
    const [suppliers, setSuppliers] = useState([]);

    const submittingRef = useRef(false);

    useEffect(() => {
        refreshJobNumber();
        api.listClientsFull().then(setClients).catch(() => setClients([]));
        api.listSuppliersFull().then(setSuppliers).catch(() => setSuppliers([]));
    }, []);

    function refreshJobNumber() {
        api.getNextJobNumber()
            .then((data) => setPreviewId(data.job_number))
            .catch(() => setPreviewId("Unavailable"));
    }

    function updateField(name, value) {
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    async function handleSubmit() {
        if (submittingRef.current) return;

        const validationError = validateJobNo(form.job_no);
        if (validationError) {
            setJobNoError(validationError);
            setError("Please fix the Job No before submitting.");
            return;
        }

        submittingRef.current = true;
        setSubmitting(true);
        setError(null);
        try {
            const payload = {
                ...form,
                customer_id: form.customer_id ? Number(form.customer_id) : null,
                supplier_id: form.supplier_id ? Number(form.supplier_id) : null,
            };
            const created = await api.createBreakdown(payload);
            setSubmittedBreakdown(created);
            resetForm();
            setJobNoError(null);
            refreshJobNumber();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
            submittingRef.current = false;
        }
    }

    function handleDiscard() {
        resetForm();
        setJobNoError(null);
        setError(null);
    }

    const isAccident = form.category === "Accident";

    return (
        <>
            <Topbar title="Operations Dashboard" />

            <PageToolbar
                crumbs={["Operational Control", "Breakdowns/Accident"]}
                subtitle="New Breakdown/Accident Entry"
                onDiscard={handleDiscard}
                onSubmit={handleSubmit}
                submitting={submitting}
            />

            {error && <p className="form-error">{error}</p>}

            <div className="incident-entry-stack">

                <FormSection icon={<FiBriefcase />} iconColor="blue" title="Job Details">
                    <div className="form-row">
                        <FormField
                            label="Record ID"
                            value={previewId}
                            readOnly
                            helper="System generated unique identifier"
                        />
                        <FormField
                            label="Job No"
                            placeholder="Enter job number"
                            value={form.job_no}
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
                            value={form.incident_datetime}
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
                            value={form.vehicle_number}
                            onChange={(e) => updateField("vehicle_number", e.target.value)}
                        />
                        <FormField
                            label="Driver"
                            value={form.driver}
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
                            value={form.category}
                            onChange={(val) => updateField("category", val)}
                        />
                        {isAccident && (
                            <SearchableSelect
                                label="Injury Category"
                                placeholder="Select injury category"
                                options={INJURY_OPTIONS}
                                value={form.injury_category}
                                onChange={(val) => updateField("injury_category", val)}
                            />
                        )}
                    </div>
                    <FormField
                        label="Category Detail"
                        type="textarea"
                        value={form.category_detail}
                        onChange={(e) => updateField("category_detail", e.target.value)}
                    />
                </FormSection>

                <FormSection icon={<FiAlertTriangle />} iconColor="red" title="Impact Assessment">
                    <div className="form-row">
                        <SearchableSelect
                            label="Route Cause"
                            placeholder="Select root cause"
                            options={ROOT_CAUSE_OPTIONS}
                            value={form.root_cause}
                            onChange={(val) => updateField("root_cause", val)}
                        />
                        <SearchableSelect
                            label="Shipment Content (Goods)"
                            placeholder="Select status"
                            options={AFFECTED_OPTIONS}
                            value={form.shipment_content}
                            onChange={(val) => updateField("shipment_content", val)}
                        />
                        <SearchableSelect
                            label="Third Party Life"
                            placeholder="Select status"
                            options={AFFECTED_OPTIONS}
                            value={form.third_party_life}
                            onChange={(val) => updateField("third_party_life", val)}
                        />
                        <SearchableSelect
                            label="Driver/Assistant Life"
                            placeholder="Select status"
                            options={AFFECTED_OPTIONS}
                            value={form.driver_assistant_life}
                            onChange={(val) => updateField("driver_assistant_life", val)}
                        />
                    </div>
                    <div className="form-row">
                        <SearchableSelect
                            label="Vehicle"
                            placeholder="Select status"
                            options={VEHICLE_OPTIONS}
                            value={form.vehicle_impact}
                            onChange={(val) => updateField("vehicle_impact", val)}
                        />
                        <SearchableSelect
                            label="Third Party Property"
                            placeholder="Select status"
                            options={AFFECTED_OPTIONS}
                            value={form.third_party_property}
                            onChange={(val) => updateField("third_party_property", val)}
                        />
                        <SearchableSelect
                            label="Delivery on Time"
                            placeholder="Select status"
                            options={DELIVERY_OPTIONS}
                            value={form.delivery_on_time}
                            onChange={(val) => updateField("delivery_on_time", val)}
                        />
                        <SearchableSelect
                            label="Involvement of Police"
                            placeholder="Select"
                            options={YES_NO_OPTIONS}
                            value={form.involvement_of_police}
                            onChange={(val) => updateField("involvement_of_police", val)}
                        />
                        <SearchableSelect
                            label="Legal Impact"
                            placeholder="Select"
                            options={YES_NO_OPTIONS}
                            value={form.legal_impact}
                            onChange={(val) => updateField("legal_impact", val)}
                        />
                    </div>
                </FormSection>

            </div>

            <BreakdownSuccessModal
                breakdown={submittedBreakdown}
                onClose={() => setSubmittedBreakdown(null)}
            />
        </>
    );
}

export default Breakdowns;