import { useState, useEffect } from "react";
import "./IncidentEntry.css";

import Topbar from "../../components/Topbar/Topbar";
import PageToolbar from "../../components/PageToolbar/PageToolbar";
import FormSection from "../../components/FormSection/FormSection";
import FormField from "../../components/FormField/FormField";
import SegmentedToggle from "../../components/SegmentedToggle/SegmentedToggle";
import ToggleSwitch from "../../components/ToggleSwitch/ToggleSwitch";
import SubmitSuccessModal from "../../components/SubmitSuccessModal/SubmitSuccessModal";
import { api } from "../../lib/api";

import {
    FiAlertTriangle,
    FiUser,
    FiMapPin,
    FiFileText,
    FiBriefcase
} from "react-icons/fi";

function validateJobNo(value) {
    if (!value) return null; // empty is allowed until required elsewhere
    const prefix = value.slice(0, 3);
    const isValidPrefix = /^[A-Z]{3}$/.test(prefix);
    const isValidLength = value.length === 11 || value.length === 13;
    if (!isValidPrefix || !isValidLength) {
        return "Incorrect job number";
    }
    return null;
}

const emptyForm = {
    job_no: "",
    customer_id: "",
    stop_category: "",
    vehicle_number: "",
    driver_name: "",
    driver_contact_number: "",
    assigned_coordinator: "",
    coordinator_mobile_number: "",
    driver_contacted: "Yes",
    driver_feedback: "",
    vehicle_parked: false,
    current_parking_location: "",
    stopped_date: "",
    stopped_time: "",
    pickup_location: "",
    via_locations: "",
    delivery_location: "",
    duration: "",
};

function IncidentEntry() {
    const [previewId, setPreviewId] = useState("Generating...");
    const [form, setForm] = useState(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [submittedIncident, setSubmittedIncident] = useState(null);
    const [jobNoError, setJobNoError] = useState(null);
    const [stopCategories, setStopCategories] = useState([]);

    const [coordinators, setCoordinators] = useState([]);
    const [clients, setClients] = useState([]);

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
        const validationError = validateJobNo(form.job_no);
        if (validationError) {
            setJobNoError(validationError);
            setError("Please fix the Job No before submitting.");
            return;
        }

        setSubmitting(true);
        setError(null);
        try {
            const payload = {
                ...form,
                customer_id: form.customer_id ? Number(form.customer_id) : null,
            };
            const created = await api.createIncident(payload);
            setSubmittedIncident(created);
            setForm(emptyForm);
            setJobNoError(null);
            refreshRequestId();
            refreshClients();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    function handleDiscard() {
        setForm(emptyForm);
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
                        <FormField
                            label="Customer"
                            type="select"
                            placeholder="Select customer"
                            options={clients.map((c) => c.name)}
                            value={clients.find((c) => c.id === Number(form.customer_id))?.name || ""}
                            onChange={(e) => {
                                const match = clients.find((c) => c.name === e.target.value);
                                updateField("customer_id", match ? match.id : "");
                            }}
                        />
                        <FormField
                            label="Vehicle Stop Category"
                            type="select"
                            placeholder="Select category"
                            options={stopCategories}
                            value={form.stop_category}
                            onChange={(e) => updateField("stop_category", e.target.value)}
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
                        <FormField
                            label="Vehicle Assigned by (Coordinator Name)"
                            type="select"
                            placeholder="Select Coordinator"
                            options={coordinators.map((c) => c.name)}
                            value={form.assigned_coordinator}
                            onChange={(e) => handleCoordinatorChange(e.target.value)}
                        />
                        <FormField
                            label="Coordinator Mobile No"
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
                            icon={<FiMapPin />}
                            placeholder="Search coordinates or address..."
                            value={form.current_parking_location}
                            onChange={(e) => updateField("current_parking_location", e.target.value)}
                        />
                        <FormField
                            label="Duration"
                            placeholder="e.g. 2h 30m"
                            value={form.duration}
                            onChange={(e) => updateField("duration", e.target.value)}
                        />
                        <FormField
                            label="Vehicle Stopped Date"
                            type="date"
                            value={form.stopped_date}
                            onChange={(e) => updateField("stopped_date", e.target.value)}
                        />
                        <FormField
                            label="Vehicle Stopped Time"
                            type="time"
                            value={form.stopped_time}
                            onChange={(e) => updateField("stopped_time", e.target.value)}
                        />
                    </div>
                    <div className="form-row form-row-3">
                        <FormField
                            label="Pickup Location"
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