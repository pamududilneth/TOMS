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
    FiClock
} from "react-icons/fi";

const STATUS_OPTIONS = ["submitted", "in_progress", "resolved"];

function EditIncident() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState(null);
    const [coordinators, setCoordinators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.getIncident(id)
            .then(setForm)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));

        api.listCoordinators()
            .then(setCoordinators)
            .catch(() => setCoordinators([]));
    }, [id]);

    function updateField(name, value) {
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    async function handleSubmit() {
        setSubmitting(true);
        setError(null);
        try {
            await api.updateIncident(id, {
                vehicle_number: form.vehicle_number,
                driver_name: form.driver_name,
                driver_contact_number: form.driver_contact_number,
                assigned_coordinator: form.assigned_coordinator,
                coordinator_mobile_number: form.coordinator_mobile_number,
                current_parking_location: form.current_parking_location,
                parked_time: form.parked_time,
                pickup_location: form.pickup_location,
                via_locations: form.via_locations,
                delivery_location: form.delivery_location,
                driver_contacted: form.driver_contacted,
                driver_feedback: form.driver_feedback,
                vehicle_parked: form.vehicle_parked,
                approver: form.approver,
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

            <div className="incident-entry-grid">

                <div className="form-main">

                    <FormSection icon={<FiAlertTriangle />} iconColor="red" title="Incident & Vehicle Info">
                        <div className="form-row">
                            <FormField
                                label="Request ID"
                                value={form.request_id}
                                readOnly
                                helper="System generated unique identifier"
                            />
                            <FormField
                                label="Vehicle Number"
                                required
                                value={form.vehicle_number}
                                onChange={(e) => updateField("vehicle_number", e.target.value)}
                            />
                        </div>
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
                                label="Driver Contact Number"
                                required
                                value={form.driver_contact_number}
                                onChange={(e) => updateField("driver_contact_number", e.target.value)}
                            />
                        </div>
                        <div className="form-row">
                            <FormField
                                label="Assigned Coordinator"
                                type="select"
                                placeholder="Select Coordinator"
                                options={coordinators}
                                value={form.assigned_coordinator || ""}
                                onChange={(e) => updateField("assigned_coordinator", e.target.value)}
                            />
                            <FormField
                                label="Coordinator Mobile Number"
                                value={form.coordinator_mobile_number || ""}
                                onChange={(e) => updateField("coordinator_mobile_number", e.target.value)}
                            />
                        </div>
                    </FormSection>

                    <FormSection icon={<FiMapPin />} iconColor="violet" title="Parking & Location">
                        <div className="form-row">
                            <FormField
                                label="Current Parking Location"
                                icon={<FiMapPin />}
                                value={form.current_parking_location || ""}
                                onChange={(e) => updateField("current_parking_location", e.target.value)}
                            />
                            <FormField
                                label="Parked Time"
                                type="datetime-local"
                                value={form.parked_time || ""}
                                onChange={(e) => updateField("parked_time", e.target.value)}
                            />
                        </div>
                        <div className="form-row form-row-3">
                            <FormField
                                label="Pickup Location"
                                value={form.pickup_location || ""}
                                onChange={(e) => updateField("pickup_location", e.target.value)}
                            />
                            <FormField
                                label="Via Location(s)"
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

                </div>

                <div className="form-side">

                    <FormSection icon={<FiFileText />} iconColor="blue" title="Status & Feedback">
                        <SegmentedToggle
                            label="Driver Contacted"
                            options={["Yes", "No"]}
                            value={form.driver_contacted}
                            onChange={(val) => updateField("driver_contacted", val)}
                        />
                        <FormField
                            label="Driver Feedback"
                            type="textarea"
                            value={form.driver_feedback || ""}
                            onChange={(e) => updateField("driver_feedback", e.target.value)}
                        />
                        <ToggleSwitch
                            label="Vehicle Parked"
                            checked={form.vehicle_parked}
                            onChange={(val) => updateField("vehicle_parked", val)}
                        />
                    </FormSection>

                    <FormSection icon={<FiCheckCircle />} iconColor="green" title="Reporting">
                        <FormField
                            label="Approver"
                            required
                            value={form.approver || ""}
                            onChange={(e) => updateField("approver", e.target.value)}
                        />
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

            </div>
        </>
    );
}

export default EditIncident;