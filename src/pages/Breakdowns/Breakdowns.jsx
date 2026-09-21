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

// Every field is required. Injury Category only applies (and is required) when Category = Accident.
function getRequiredFields(form) {
    const fields = [
        { key: "incident_datetime", label: "Incident Date/Time" },
        { key: "job_no", label: "Job No" },
        { key: "customer_id", label: "Customer" },
        { key: "vehicle_number", label: "Vehicle No" },
        { key: "driver", label: "Driver" },
        { key: "supplier_id", label: "Supplier" },
        { key: "category", label: "Category" },
        { key: "category_detail", label: "Category Detail" },
        { key: "root_cause", label: "Route Cause" },
        { key: "shipment_content", label: "Shipment Content (Goods)" },
        { key: "third_party_life", label: "Third Party Life" },
        { key: "driver_assistant_life", label: "Driver/Assistant Life" },
        { key: "vehicle_impact", label: "Vehicle" },
        { key: "third_party_property", label: "Third Party Property" },
        { key: "delivery_on_time", label: "Delivery on Time" },
        { key: "involvement_of_police", label: "Involvement of Police" },
        { key: "legal_impact", label: "Legal Impact" },
    ];
    if (form.category === "Accident") {
        fields.push({ key: "injury_category", label: "Injury Category" });
    }
    return fields;
}

function Breakdowns() {
    const { form, setForm, resetForm } = useBreakdownDraft();

    const [previewId, setPreviewId] = useState("Generating...");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [jobNoError, setJobNoError] = useState(() => validateJobNo(form.job_no));
    const [fieldErrors, setFieldErrors] = useState({});
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
        if (fieldErrors[name]) {
            setFieldErrors((prev) => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        }
    }

    async function handleSubmit() {
        if (submittingRef.current) return;

        const validationError = validateJobNo(form.job_no);
        if (validationError) {
            setJobNoError(validationError);
            setError("Please fix the Job No before submitting.");
            return;
        }

        const required = getRequiredFields(form);
        const missing = {};
        required.forEach(({ key, label }) => {
            const value = form[key];
            if (value === null || value === undefined || String(value).trim() === "") {
                missing[key] = "This field is required";
            }
        });

        if (Object.keys(missing).length > 0) {
            setFieldErrors(missing);
            setError("Please fill in all required fields, highlighted below.");
            return;
        }

        setFieldErrors({});
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
        setFieldErrors({});
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
                            required
                            placeholder="Enter job number"
                            value={form.job_no}
                            error={fieldErrors.job_no}
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
                            required
                            type="datetime-local"
                            value={form.incident_datetime}
                            error={fieldErrors.incident_datetime}
                            onChange={(e) => updateField("incident_datetime", e.target.value)}
                        />
                    </div>
                    <div className="form-row">
                        <SearchableSelect
                            label="Customer"
                            required
                            placeholder="Select customer"
                            options={clients.map((c) => c.name)}
                            value={clients.find((c) => c.id === Number(form.customer_id))?.name || ""}
                            error={fieldErrors.customer_id}
                            onChange={(name) => {
                                const match = clients.find((c) => c.name === name);
                                updateField("customer_id", match ? match.id : "");
                            }}
                        />
                        <FormField
                            label="Vehicle No"
                            required
                            value={form.vehicle_number}
                            error={fieldErrors.vehicle_number}
                            onChange={(e) => updateField("vehicle_number", e.target.value)}
                        />
                        <FormField
                            label="Driver"
                            required
                            value={form.driver}
                            error={fieldErrors.driver}
                            onChange={(e) => updateField("driver", e.target.value)}
                        />
                    </div>
                </FormSection>

                <FormSection icon={<FiUsers />} iconColor="violet" title="Supplier & Category">
                    <div className="form-row">
                        <SearchableSelect
                            label="Supplier"
                            required
                            placeholder="Select supplier"
                            options={suppliers.map((s) => s.name)}
                            value={suppliers.find((s) => s.id === Number(form.supplier_id))?.name || ""}
                            error={fieldErrors.supplier_id}
                            onChange={(name) => {
                                const match = suppliers.find((s) => s.name === name);
                                updateField("supplier_id", match ? match.id : "");
                            }}
                        />
                        <SearchableSelect
                            label="Category"
                            required
                            placeholder="Select category"
                            options={CATEGORY_OPTIONS}
                            value={form.category}
                            error={fieldErrors.category}
                            onChange={(val) => updateField("category", val)}
                        />
                        {isAccident && (
                            <SearchableSelect
                                label="Injury Category"
                                required
                                placeholder="Select injury category"
                                options={INJURY_OPTIONS}
                                value={form.injury_category}
                                error={fieldErrors.injury_category}
                                onChange={(val) => updateField("injury_category", val)}
                            />
                        )}
                    </div>
                    <FormField
                        label="Category Detail"
                        required
                        type="textarea"
                        value={form.category_detail}
                        error={fieldErrors.category_detail}
                        onChange={(e) => updateField("category_detail", e.target.value)}
                    />
                </FormSection>

                <FormSection icon={<FiAlertTriangle />} iconColor="red" title="Impact Assessment">
                    <div className="form-row">
                        <SearchableSelect
                            label="Route Cause"
                            required
                            placeholder="Select root cause"
                            options={ROOT_CAUSE_OPTIONS}
                            value={form.root_cause}
                            error={fieldErrors.root_cause}
                            onChange={(val) => updateField("root_cause", val)}
                        />
                        <SearchableSelect
                            label="Shipment Content (Goods)"
                            required
                            placeholder="Select status"
                            options={AFFECTED_OPTIONS}
                            value={form.shipment_content}
                            error={fieldErrors.shipment_content}
                            onChange={(val) => updateField("shipment_content", val)}
                        />
                        <SearchableSelect
                            label="Third Party Life"
                            required
                            placeholder="Select status"
                            options={AFFECTED_OPTIONS}
                            value={form.third_party_life}
                            error={fieldErrors.third_party_life}
                            onChange={(val) => updateField("third_party_life", val)}
                        />
                        <SearchableSelect
                            label="Driver/Assistant Life"
                            required
                            placeholder="Select status"
                            options={AFFECTED_OPTIONS}
                            value={form.driver_assistant_life}
                            error={fieldErrors.driver_assistant_life}
                            onChange={(val) => updateField("driver_assistant_life", val)}
                        />
                    </div>
                    <div className="form-row">
                        <SearchableSelect
                            label="Vehicle"
                            required
                            placeholder="Select status"
                            options={VEHICLE_OPTIONS}
                            value={form.vehicle_impact}
                            error={fieldErrors.vehicle_impact}
                            onChange={(val) => updateField("vehicle_impact", val)}
                        />
                        <SearchableSelect
                            label="Third Party Property"
                            required
                            placeholder="Select status"
                            options={AFFECTED_OPTIONS}
                            value={form.third_party_property}
                            error={fieldErrors.third_party_property}
                            onChange={(val) => updateField("third_party_property", val)}
                        />
                        <SearchableSelect
                            label="Delivery on Time"
                            required
                            placeholder="Select status"
                            options={DELIVERY_OPTIONS}
                            value={form.delivery_on_time}
                            error={fieldErrors.delivery_on_time}
                            onChange={(val) => updateField("delivery_on_time", val)}
                        />
                        <SearchableSelect
                            label="Involvement of Police"
                            required
                            placeholder="Select"
                            options={YES_NO_OPTIONS}
                            value={form.involvement_of_police}
                            error={fieldErrors.involvement_of_police}
                            onChange={(val) => updateField("involvement_of_police", val)}
                        />
                        <SearchableSelect
                            label="Legal Impact"
                            required
                            placeholder="Select"
                            options={YES_NO_OPTIONS}
                            value={form.legal_impact}
                            error={fieldErrors.legal_impact}
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