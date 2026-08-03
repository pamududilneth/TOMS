import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../Breakdowns/Breakdowns.css";

import Topbar from "../../components/Topbar/Topbar";
import PageToolbar from "../../components/PageToolbar/PageToolbar";
import FormSection from "../../components/FormSection/FormSection";
import FormField from "../../components/FormField/FormField";
import SegmentedToggle from "../../components/SegmentedToggle/SegmentedToggle";
import ImageUploadField from "../../components/ImageUploadField/ImageUploadField";
import { api } from "../../lib/api";

import {
    FiBriefcase,
    FiNavigation,
    FiAlertTriangle,
    FiCamera,
    FiCheckSquare
} from "react-icons/fi";

const STATUS_OPTIONS = ["submitted", "in_progress", "resolved"];

function EditBreakdown() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState(null);
    const [newImageFile, setNewImageFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.getBreakdown(id)
            .then(setForm)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    function updateField(name, value) {
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    async function handleSubmit() {
        setSubmitting(true);
        setError(null);
        try {
            await api.updateBreakdown(id, {
                vehicle_number: form.vehicle_number,
                requesting_plant: form.requesting_plant,
                pickup_location: form.pickup_location,
                via_location: form.via_location,
                delivery_location: form.delivery_location,
                incident_type: form.incident_type,
                incident_datetime: form.incident_datetime,
                location: form.location,
                reason: form.reason,
                action_taken: form.action_taken,
                priority: form.priority,
                status: form.status,
            });

            if (newImageFile) {
                const formData = new FormData();
                formData.append("image", newImageFile);
                await api.replaceBreakdownImage(id, formData);
            }

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

    return (
        <>
            <Topbar title="Operations Dashboard" />

            <PageToolbar
                crumbs={["Operational Control", "Vehicle Breakdown Management", form.job_number]}
                subtitle="Edit Breakdown"
                onDiscard={() => navigate("/reports")}
                onSubmit={handleSubmit}
                submitting={submitting}
                discardLabel="Cancel"
                submitLabel="Save Changes"
                submittingLabel="Saving..."
            />

            {error && <p className="form-error">{error}</p>}

            <div className="breakdowns-grid">

                <div className="breakdowns-col">

                    <FormSection icon={<FiBriefcase />} iconColor="blue" title="Logistic Details">
                        <div className="form-row">
                            <FormField
                                label="Job Number"
                                value={form.job_number}
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
                        <FormField
                            label="Requesting Plant"
                            value={form.requesting_plant || ""}
                            onChange={(e) => updateField("requesting_plant", e.target.value)}
                        />
                    </FormSection>

                    <FormSection icon={<FiAlertTriangle />} iconColor="red" title="Incident Details">
                        <SegmentedToggle
                            label="Incident Type"
                            options={["Breakdown", "Accident"]}
                            value={form.incident_type}
                            onChange={(val) => updateField("incident_type", val)}
                        />
                        <div className="form-row">
                            <FormField
                                label="Incident Date & Time"
                                type="datetime-local"
                                value={form.incident_datetime || ""}
                                onChange={(e) => updateField("incident_datetime", e.target.value)}
                            />
                            <FormField
                                label="Location"
                                value={form.location || ""}
                                onChange={(e) => updateField("location", e.target.value)}
                            />
                        </div>
                        <FormField
                            label="Reason / Incident Description"
                            type="textarea"
                            value={form.reason || ""}
                            onChange={(e) => updateField("reason", e.target.value)}
                        />
                    </FormSection>

                </div>

                <div className="breakdowns-col">

                    <FormSection icon={<FiNavigation />} iconColor="violet" title="Route Information">
                        <FormField
                            label="Pickup Location"
                            value={form.pickup_location || ""}
                            onChange={(e) => updateField("pickup_location", e.target.value)}
                        />
                        <FormField
                            label="Via Location"
                            value={form.via_location || ""}
                            onChange={(e) => updateField("via_location", e.target.value)}
                        />
                        <FormField
                            label="Delivery Location"
                            value={form.delivery_location || ""}
                            onChange={(e) => updateField("delivery_location", e.target.value)}
                        />
                    </FormSection>

                    <FormSection icon={<FiCamera />} iconColor="blue" title="Visual Evidence">
                        {form.image_filename && !newImageFile && (
                            <div className="edit-current-image">
                                <span className="edit-current-image-label">Current image:</span>
                                <img
                                    src={`/api/breakdowns/uploads/${form.image_filename}`}
                                    alt="Current breakdown site"
                                />
                            </div>
                        )}
                        <ImageUploadField
                            label={form.image_filename ? "Replace image (optional)" : "Image of the breakdown place"}
                            onFileSelected={setNewImageFile}
                        />
                    </FormSection>

                    <FormSection icon={<FiCheckSquare />} iconColor="green" title="Monitoring Center Action">
                        <FormField
                            label="Action Taken / Resolution Notes"
                            type="textarea"
                            value={form.action_taken || ""}
                            onChange={(e) => updateField("action_taken", e.target.value)}
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

export default EditBreakdown;