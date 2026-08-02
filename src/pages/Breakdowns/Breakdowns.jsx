import { useState, useEffect } from "react";
import "./Breakdowns.css";

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
    FiCheckSquare,
    FiPrinter,
    FiSend
} from "react-icons/fi";

const emptyForm = {
    vehicle_number: "",
    requesting_plant: "",
    pickup_location: "",
    via_location: "",
    delivery_location: "",
    incident_type: "Breakdown",
    incident_datetime: "",
    location: "",
    reason: "",
    action_taken: "",
};

function Breakdowns() {
    const [previewId, setPreviewId] = useState("Generating...");
    const [form, setForm] = useState(emptyForm);
    const [imageFile, setImageFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        refreshJobNumber();
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
        setSubmitting(true);
        setError(null);
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([key, value]) => {
                formData.append(key, value ?? "");
            });
            if (imageFile) {
                formData.append("image", imageFile);
            }

            await api.createBreakdown(formData);

            setForm(emptyForm);
            setImageFile(null);
            refreshJobNumber();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    function handleDiscard() {
        setForm(emptyForm);
        setImageFile(null);
        setError(null);
    }

    return (
        <>
            <Topbar title="Operations Dashboard" />

            <PageToolbar
                crumbs={["Operational Control", "Vehicle Breakdown Management"]}
                subtitle="Incident report and logistics rerouting form"
                onDiscard={handleDiscard}
                onSubmit={handleSubmit}
                submitting={submitting}
            />

            {error && <p className="form-error">{error}</p>}

            <div className="breakdowns-grid">

                <div className="breakdowns-col">

                    <FormSection icon={<FiBriefcase />} iconColor="blue" title="Logistic Details">
                        <div className="form-row">
                            <FormField
                                label="Job Number"
                                value={previewId}
                                readOnly
                                helper="System generated unique identifier"
                            />
                            <FormField
                                label="Vehicle Number"
                                required
                                placeholder="e.g. MH 12 AB 1234"
                                value={form.vehicle_number}
                                onChange={(e) => updateField("vehicle_number", e.target.value)}
                            />
                        </div>
                        <FormField
                            label="Requesting Plant"
                            type="select"
                            placeholder="Select requesting plant"
                            options={[
                                "Central Distribution Center (CDC-01)",
                                "Brandix Apparel Solutions Ltd, Essentials Ekala",
                                "Expo Global Distribution Centre",
                            ]}
                            value={form.requesting_plant}
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
                                value={form.incident_datetime}
                                onChange={(e) => updateField("incident_datetime", e.target.value)}
                            />
                            <FormField
                                label="Location"
                                placeholder="Search or select on map"
                                value={form.location}
                                onChange={(e) => updateField("location", e.target.value)}
                            />
                        </div>
                        <FormField
                            label="Reason / Incident Description"
                            type="textarea"
                            placeholder="Provide a detailed description of what happened..."
                            value={form.reason}
                            onChange={(e) => updateField("reason", e.target.value)}
                        />
                    </FormSection>

                </div>

                <div className="breakdowns-col">

                    <FormSection icon={<FiNavigation />} iconColor="violet" title="Route Information">
                        <FormField
                            label="Pickup Location"
                            placeholder="Enter origin address"
                            value={form.pickup_location}
                            onChange={(e) => updateField("pickup_location", e.target.value)}
                        />
                        <FormField
                            label="Via Location"
                            placeholder="Transit points"
                            value={form.via_location}
                            onChange={(e) => updateField("via_location", e.target.value)}
                        />
                        <FormField
                            label="Delivery Location"
                            placeholder="Enter destination address"
                            value={form.delivery_location}
                            onChange={(e) => updateField("delivery_location", e.target.value)}
                        />
                    </FormSection>

                    <FormSection icon={<FiCamera />} iconColor="blue" title="Visual Evidence">
                        <ImageUploadField
                            label="Image of the breakdown place"
                            onFileSelected={setImageFile}
                        />
                    </FormSection>

                    <FormSection icon={<FiCheckSquare />} iconColor="green" title="Monitoring Center Action">
                        <FormField
                            label="Action Taken / Resolution Notes"
                            type="textarea"
                            placeholder="Document the recovery steps, tow dispatch details, or rerouting instructions..."
                            value={form.action_taken}
                            onChange={(e) => updateField("action_taken", e.target.value)}
                        />
                        <div className="priority-flag">
                            <span className="priority-dot" />
                            Priority: High Intervention
                        </div>
                    </FormSection>

                </div>

            </div>

            <div className="breakdowns-footer-actions">
                <button type="button" className="btn-outline" onClick={() => window.print()}>
                    <FiPrinter />
                    Print Summary
                </button>
                <button type="button" className="btn-dark" onClick={handleSubmit} disabled={submitting}>
                    <FiSend />
                    {submitting ? "Submitting..." : "Finalize and Notify Teams"}
                </button>
            </div>
        </>
    );
}

export default Breakdowns;