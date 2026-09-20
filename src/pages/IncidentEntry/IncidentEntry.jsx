import { useState, useEffect, useRef } from "react";
import "./IncidentEntry.css";

import Topbar from "../../components/Topbar/Topbar";
import PageToolbar from "../../components/PageToolbar/PageToolbar";
import FormSection from "../../components/FormSection/FormSection";
import FormField from "../../components/FormField/FormField";
import SearchableSelect from "../../components/SearchableSelect/SearchableSelect";
import SegmentedToggle from "../../components/SegmentedToggle/SegmentedToggle";
import ToggleSwitch from "../../components/ToggleSwitch/ToggleSwitch";
import SubmitSuccessModal from "../../components/SubmitSuccessModal/SubmitSuccessModal";
import { api } from "../../lib/api";
import { useIncidentDraft } from "../../context/IncidentDraftContext";

import {
    FiAlertTriangle,
    FiUser,
    FiMapPin,
    FiFileText,
    FiBriefcase
} from "react-icons/fi";

function validateJobNo(value) {
    if (!value) return null;
    const prefix = value.slice(0, 3);
    const isValidPrefix = /^[A-Z]{3}$/.test(prefix);
    const isValidLength = value.length === 11 || value.length === 13;
    if (!isValidPrefix || !isValidLength) {
        return "Incorrect job number";
    }
    return null;
}

// Every field is mandatory except Via Location(s)
const REQUIRED_FIELDS = [
    { key: "job_no", label: "Job No" },
    { key: "customer_id", label: "Customer" },
    { key: "stop_category", label: "Vehicle Stop Category" },
    { key: "vehicle_number", label: "Vehicle No" },
    { key: "driver_name", label: "Driver Name" },
    { key: "driver_contact_number", label: "Driver Contact No" },
    { key: "assigned_coordinator", label: "Vehicle Assigned by (Coordinator Name)" },
    { key: "coordinator_mobile_number", label: "Coordinator Mobile No" },
    { key: "driver_feedback", label: "Driver Feedback - If Contacted" },
    { key: "current_parking_location", label: "Vehicle Stopped Location" },
    { key: "stopped_date", label: "Vehicle Stopped Date" },
    { key: "stopped_time", label: "Vehicle Stopped Time" },
    { key: "pickup_location", label: "Pickup Location" },
    { key: "delivery_location", label: "Delivery Location" },
    { key: "duration", label: "Duration" },
];

function validateRequiredFields(form) {
    return REQUIRED_FIELDS
        .filter(({ key }) => {
            const value = form[key];
            return value === null || value === undefined || String(value).trim() === "";
        })
        .map((f) => f.label);
}

function IncidentEntry() {
    const { form, setForm, resetForm } = useIncidentDraft();

    const [previewId, setPreviewId] = useState("Generating...");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [submittedIncident, setSubmittedIncident] = useState(null);
    const [jobNoError, setJobNoError] = useState(() => validateJobNo(form.job_no));
    const [stopCategories, setStopCategories] = useState([]);

    const [coordinators, setCoordinators] = useState([]);
    const [clients, setClients] = useState([]);

    const submittingRef = useRef(false);

    useEffect(() => {
        refreshRequestId();
        refreshCoordinators();
        refreshClients();

        api.listStopCategories().then(setStopCategories).catch(() => setStopCategories([]));
    }, []);

    function refreshRequestId() {
        api.getNextRequestId()
            .then((data) => setPreviewId(data.request_id))
            .catch(() => setPreviewId("Unavailable"));
    }

    function refreshCoordinators() {
        api.listCoordinatorsFull()
            .then(setCoordinators)
            .catch(() => setCoordinators([]));
    }

    function refreshClients() {
        api.listClientsFull()
            .then(setClients)
            .catch(() => setClients([]));
    }

    function updateField(name, value) {
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    function handleCoordinatorChange(name) {
        const match = coordinators.find((c) => c.name === name);
        setForm((prev) => ({
            ...prev,
            assigned_coordinator: name,
            coordinator_mobile_number: match?.mobile_number || "",
        }));
    }

    async function handleSubmit() {
        if (submittingRef.current) return;

        const validationError = validateJobNo(form.job_no);
        if (validationError) {
            setJobNoError(validationError);
            setError("Please fix the Job No before submitting.");
            return;
        }

        const missing = validateRequiredFields(form);
        if (missing.length > 0) {
            setError(`Please fill in the following required fields: ${missing.join(", ")}`);
            return;
        }

        submittingRef.current = true;
        setSubmitting(true);
        setError(null);
        try {
            const payload = {
                ...form,
                customer_id: form.customer_id ? Number(form.customer_id) : null,
            };
            const created = await api.createIncident(payload);
            setSubmittedIncident(created);
            resetForm();
            setJobNoError(null);
            refreshRequestId();
            refreshClients();
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

    return (
        <>
            <Topbar title="Operations Dashboard" />

            <PageToolbar
                crumbs={["Operational Control", "Unplanned Stop Management"]}
                subtitle="New Incident Entry"
                onDiscard={handleDiscard}
                onSubmit={handleSubmit}
                submitting={submitting}
            />

            {error && <p className="form-error">{error}</p>}

            <div className="incident-entry-stack">
                <FormSection icon={<FiBriefcase />} iconColor="blue" title="Job & Customer">
                    <div className="form-row">
                        <FormField
                            label="Key"
                            value={previewId}
                            readOnly
                            helper="System generated unique identifier"
                        />
                        <FormField
                            label="Job No"
                            required
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
                    </div>
                    <div className="form-row">
                        <SearchableSelect
                            label="Customer"
                            required
                            placeholder="Select customer"
                            options={clients.map((c) => c.name)}
                            value={clients.find((c) => c.id === Number(form.customer_id))?.name || ""}
                            onChange={(name) => {
                                const match = clients.find((c) => c.name === name);
                                updateField("customer_id", match ? match.id : "");
                            }}
                        />
                        <SearchableSelect
                            label="Vehicle Stop Category"
                            required
                            placeholder="Select category"
                            options={stopCategories}
                            value={form.stop_category}
                            onChange={(val) => updateField("stop_category", val)}
                        />
                    </div>
                </FormSection>

                <FormSection icon={<FiAlertTriangle />} iconColor="red" title="Vehicle Info">
                    <FormField
                        label="Vehicle No"
                        required
                        placeholder="e.g. MH 12 AB 1234"
                        value={form.vehicle_number}
                        onChange={(e) => updateField("vehicle_number", e.target.value)}
                    />
                </FormSection>

                <FormSection icon={<FiUser />} iconColor="blue" title="Personnel Details">
                    <div className="form-row">
                        <FormField
                            label="Driver Name"
                            required
                            placeholder="Enter driver name"
                            value={form.driver_name}
                            onChange={(e) => updateField("driver_name", e.target.value)}
                        />
                        <FormField
                            label="Driver Contact No"
                            required
                            placeholder="Enter contact number"
                            value={form.driver_contact_number}
                            onChange={(e) => updateField("driver_contact_number", e.target.value)}
                        />
                        <SearchableSelect
                            label="Vehicle Assigned by (Coordinator Name)"
                            required
                            placeholder="Select Coordinator"
                            options={coordinators.map((c) => c.name)}
                            value={form.assigned_coordinator}
                            onChange={handleCoordinatorChange}
                        />
                        <FormField
                            label="Coordinator Mobile No"
                            required
                            value={form.coordinator_mobile_number}
                            readOnly
                            helper="Auto-filled from selected coordinator"
                        />
                    </div>
                </FormSection>

                <FormSection icon={<FiMapPin />} iconColor="violet" title="Stop Details">
                    <div className="form-row">
                        <FormField
                            label="Vehicle Stopped Location"
                            required
                            icon={<FiMapPin />}
                            placeholder="Search coordinates or address..."
                            value={form.current_parking_location}
                            onChange={(e) => updateField("current_parking_location", e.target.value)}
                        />
                        <FormField
                            label="Duration"
                            required
                            placeholder="e.g. 2h 30m"
                            value={form.duration}
                            onChange={(e) => updateField("duration", e.target.value)}
                        />
                        <FormField
                            label="Vehicle Stopped Date"
                            required
                            type="date"
                            value={form.stopped_date}
                            onChange={(e) => updateField("stopped_date", e.target.value)}
                        />
                        <FormField
                            label="Vehicle Stopped Time"
                            required
                            type="time"
                            value={form.stopped_time}
                            onChange={(e) => updateField("stopped_time", e.target.value)}
                        />
                    </div>
                    <div className="form-row form-row-3">
                        <FormField
                            label="Pickup Location"
                            required
                            value={form.pickup_location}
                            onChange={(e) => updateField("pickup_location", e.target.value)}
                        />
                        <FormField
                            label="Via Location/s"
                            value={form.via_locations}
                            onChange={(e) => updateField("via_locations", e.target.value)}
                        />
                        <FormField
                            label="Delivery Location"
                            required
                            value={form.delivery_location}
                            onChange={(e) => updateField("delivery_location", e.target.value)}
                        />
                    </div>
                </FormSection>

                <FormSection icon={<FiFileText />} iconColor="blue" title="Status & Feedback">
                    <div className="form-row">
                        <SegmentedToggle
                            label="Driver Contacted by OKI DOKI"
                            options={["Yes", "No"]}
                            value={form.driver_contacted}
                            onChange={(val) => updateField("driver_contacted", val)}
                        />
                        <ToggleSwitch
                            label="Vehicle Parking with Goods"
                            checked={form.vehicle_parked}
                            onChange={(val) => updateField("vehicle_parked", val)}
                        />
                    </div>
                    <FormField
                        label="Driver Feedback - If Contacted"
                        required
                        type="textarea"
                        value={form.driver_feedback}
                        onChange={(e) => updateField("driver_feedback", e.target.value)}
                    />
                </FormSection>
            </div>

            <SubmitSuccessModal
                incident={submittedIncident}
                onClose={() => setSubmittedIncident(null)}
            />
        </>
    );
}

export default IncidentEntry;