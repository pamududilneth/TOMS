import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../IncidentEntry/IncidentEntry.css";

import Topbar from "../../components/Topbar/Topbar";
import PageToolbar from "../../components/PageToolbar/PageToolbar";
import FormSection from "../../components/FormSection/FormSection";
import FormField from "../../components/FormField/FormField";
import SegmentedToggle from "../../components/SegmentedToggle/SegmentedToggle";
import ToggleSwitch from "../../components/ToggleSwitch/ToggleSwitch";
import { api } from "../../lib/api";

import {
    FiAlertTriangle,
    FiUser,
    FiMapPin,
    FiFileText,
    FiCheckCircle,
    FiBriefcase
} from "react-icons/fi";

const STATUS_OPTIONS = ["submitted", "in_progress", "resolved"];

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

function EditIncident() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState(null);
    const [coordinators, setCoordinators] = useState([]);
    const [clients, setClients] = useState([]);
    const [stopCategories, setStopCategories] = useState([]);
    const [jobNoError, setJobNoError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.getIncident(id)
            .then((data) => {
                setForm(data);
                setJobNoError(validateJobNo(data.job_no || ""));
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));

        api.listCoordinatorsFull()
            .then(setCoordinators)
            .catch(() => setCoordinators([]));

        api.listClientsFull()
            .then(setClients)
            .catch(() => setClients([]));

        api.listStopCategories()
            .then(setStopCategories)
            .catch(() => setStopCategories([]));
    }, [id]);

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
            setError("Please fix the Job No before saving.");
            return;
        }

        setSubmitting(true);
        setError(null);
        try {
            await api.updateIncident(id, {
                job_no: form.job_no,
                customer_id: form.customer_id ? Number(form.customer_id) : null,
                stop_category: form.stop_category,
                vehicle_number: form.vehicle_number,
                driver_name: form.driver_name,
                driver_contact_number: form.driver_contact_number,
                assigned_coordinator: form.assigned_coordinator,
                coordinator_mobile_number: form.coordinator_mobile_number,
                driver_contacted: form.driver_contacted,
                driver_feedback: form.driver_feedback,
                vehicle_parked: form.vehicle_parked,
                current_parking_location: form.current_parking_location,
                stopped_date: form.stopped_date,
                stopped_time: form.stopped_time,
                pickup_location: form.pickup_location,
                via_locations: form.via_locations,
                delivery_location: form.delivery_location,
                duration: form.duration,
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
                    Loading incident...
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

    return (
        <>
            <Topbar title="Operations Dashboard" />

            <PageToolbar
                crumbs={["Operational Control", "Unplanned Stop Management", form.request_id]}
                subtitle="Edit Incident"
                onDiscard={() => navigate("/reports")}
                onSubmit={handleSubmit}
                submitting={submitting}
                discardLabel="Cancel"
                submitLabel="Save Changes"
                submittingLabel="Saving..."
            />

            {error && <p className="form-error">{error}</p>}

            <div className="incident-entry-stack">

                <FormSection icon={<FiBriefcase />} iconColor="blue" title="Job & Customer">
                    <div className="form-row">
                        <FormField
                            label="Key"
                            value={form.request_id}
                            readOnly
                            helper="System generated unique identifier"
                        />
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
                            value={form.stop_category || ""}
                            onChange={(e) => updateField("stop_category", e.target.value)}
                        />
                    </div>
                </FormSection>

                <FormSection icon={<FiAlertTriangle />} iconColor="red" title="Vehicle Info">
                    <FormField
                        label="Vehicle No"
                        required
                        value={form.vehicle_number}
                        onChange={(e) => updateField("vehicle_number", e.target.value)}
                    />
                </FormSection>

                <FormSection icon={<FiUser />} iconColor="blue" title="Personnel Details">
                    <div className="form-row">
                        <FormField
                            label="Driver Name"
                            required
                            value={form.driver_name}
                            onChange={(e) => updateField("driver_name", e.target.value)}
                        />
                        <FormField
                            label="Driver Contact No"
                            required
                            value={form.driver_contact_number}
                            onChange={(e) => updateField("driver_contact_number", e.target.value)}
                        />
                        <FormField
                            label="Vehicle Assigned by (Coordinator Name)"
                            type="select"
                            placeholder="Select Coordinator"
                            options={coordinators.map((c) => c.name)}
                            value={form.assigned_coordinator || ""}
                            onChange={(e) => handleCoordinatorChange(e.target.value)}
                        />
                        <FormField
                            label="Coordinator Mobile No"
                            value={form.coordinator_mobile_number || ""}
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
                            value={form.current_parking_location || ""}
                            onChange={(e) => updateField("current_parking_location", e.target.value)}
                        />
                        <FormField
                            label="Duration"
                            value={form.duration || ""}
                            onChange={(e) => updateField("duration", e.target.value)}
                        />
                        <FormField
                            label="Vehicle Stopped Date"
                            type="date"
                            value={form.stopped_date || ""}
                            onChange={(e) => updateField("stopped_date", e.target.value)}
                        />
                        <FormField
                            label="Vehicle Stopped Time"
                            type="time"
                            value={form.stopped_time || ""}
                            onChange={(e) => updateField("stopped_time", e.target.value)}
                        />
                    </div>
                    <div className="form-row form-row-3">
                        <FormField
                            label="Pickup Location"
                            value={form.pickup_location || ""}
                            onChange={(e) => updateField("pickup_location", e.target.value)}
                        />
                        <FormField
                            label="Via Location/s"
                            value={form.via_locations || ""}
                            onChange={(e) => updateField("via_locations", e.target.value)}
                        />
                        <FormField
                            label="Delivery Location"
                            value={form.delivery_location || ""}
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
                        <FormField
                            label="Status"
                            type="select"
                            placeholder="Select status"
                            options={STATUS_OPTIONS}
                            value={form.status}
                            onChange={(e) => updateField("status", e.target.value)}
                        />
                    </div>
                    <FormField
                        label="Driver Feedback - If Contacted"
                        type="textarea"
                        value={form.driver_feedback || ""}
                        onChange={(e) => updateField("driver_feedback", e.target.value)}
                    />
                </FormSection>

            </div>
        </>
    );
}

export default EditIncident;