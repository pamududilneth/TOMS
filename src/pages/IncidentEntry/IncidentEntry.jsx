import { useState, useEffect } from "react";
import "./IncidentEntry.css";

import Topbar from "../../components/Topbar/Topbar";
import PageToolbar from "../../components/PageToolbar/PageToolbar";
import FormSection from "../../components/FormSection/FormSection";
import FormField from "../../components/FormField/FormField";
import SegmentedToggle from "../../components/SegmentedToggle/SegmentedToggle";
import ToggleSwitch from "../../components/ToggleSwitch/ToggleSwitch";
import ClientShareSelect from "../../components/ClientShareSelect/ClientShareSelect";
import SubmitSuccessModal from "../../components/SubmitSuccessModal/SubmitSuccessModal";
import { api } from "../../lib/api";

import {
    FiAlertTriangle,
    FiUser,
    FiMapPin,
    FiFileText,
    FiCheckCircle,
    FiClock
} from "react-icons/fi";

const emptyForm = {
    vehicle_number: "",
    driver_name: "",
    driver_contact_number: "",
    assigned_coordinator: "",
    coordinator_mobile_number: "",
    current_parking_location: "",
    parked_time: "",
    pickup_location: "",
    via_locations: "",
    delivery_location: "",
    driver_contacted: "Yes",
    driver_feedback: "",
    vehicle_parked: false,
    approver: "",
};

function IncidentEntry() {
    const [previewId, setPreviewId] = useState("Generating...");
    const [form, setForm] = useState(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [submittedIncident, setSubmittedIncident] = useState(null); // Added state for the modal

    const [coordinators, setCoordinators] = useState([]);
    const [clients, setClients] = useState([]);
    const [selectedClientIds, setSelectedClientIds] = useState([]);

    useEffect(() => {
        refreshRequestId();
        refreshCoordinators();
        refreshClients();
    }, []);

    function refreshRequestId() {
        api.getNextRequestId()
            .then((data) => setPreviewId(data.request_id))
            .catch(() => setPreviewId("Unavailable"));
    }

    function refreshCoordinators() {
        api.listCoordinators()
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

    // Updated handleSubmit with modal logic
    async function handleSubmit() {
        setSubmitting(true);
        setError(null);
        try {
            const created = await api.createIncident({ ...form, client_ids: selectedClientIds });
            setSubmittedIncident(created); // Triggers the modal to open
            setForm(emptyForm);
            setSelectedClientIds([]);
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
        setSelectedClientIds([]);
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

            <div className="incident-entry-grid">
                <div className="form-main">
                    <FormSection icon={<FiAlertTriangle />} iconColor="red" title="Incident & Vehicle Info">
                        <div className="form-row">
                            <FormField
                                label="Request ID"
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
                                label="Driver Contact Number"
                                required
                                placeholder="Enter contact number"
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
                                value={form.assigned_coordinator}
                                onChange={(e) => updateField("assigned_coordinator", e.target.value)}
                            />
                            <FormField
                                label="Coordinator Mobile Number"
                                placeholder="Enter mobile number"
                                value={form.coordinator_mobile_number}
                                onChange={(e) => updateField("coordinator_mobile_number", e.target.value)}
                            />
                        </div>
                    </FormSection>

                    <FormSection icon={<FiMapPin />} iconColor="violet" title="Parking & Location">
                        <div className="form-row">
                            <FormField
                                label="Current Parking Location"
                                icon={<FiMapPin />}
                                placeholder="Search coordinates or address..."
                                value={form.current_parking_location}
                                onChange={(e) => updateField("current_parking_location", e.target.value)}
                            />
                            <FormField
                                label="Parked Time"
                                icon={<FiClock />}
                                placeholder="--:-- --"
                                value={form.parked_time}
                                onChange={(e) => updateField("parked_time", e.target.value)}
                            />
                        </div>
                        <div className="form-row form-row-3">
                            <FormField
                                label="Pickup Location"
                                placeholder="Enter pickup location"
                                value={form.pickup_location}
                                onChange={(e) => updateField("pickup_location", e.target.value)}
                            />
                            <FormField
                                label="Via Location(s)"
                                placeholder="Separate with commas"
                                value={form.via_locations}
                                onChange={(e) => updateField("via_locations", e.target.value)}
                            />
                            <FormField
                                label="Delivery Location"
                                placeholder="Enter delivery location"
                                value={form.delivery_location}
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
                            placeholder="Enter detailed feedback from the driver..."
                            value={form.driver_feedback}
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
                            type="select"
                            placeholder="Select Level 1 Approver"
                            options={["Approver A", "Approver B"]}
                            value={form.approver}
                            onChange={(e) => updateField("approver", e.target.value)}
                        />
                        <ClientShareSelect
                            clients={clients}
                            selectedIds={selectedClientIds}
                            onChange={setSelectedClientIds}
                        />
                    </FormSection>

                    <div className="guideline-box">
                        <div className="guideline-title">
                            <FiFileText />
                            Entry Guidelines
                        </div>
                        <ul>
                            <li>All fields marked * are mandatory</li>
                            <li>Each selected customer gets a live-updating Google Sheet</li>
                            <li>Customers are emailed the link only the first time</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Added Modal Component */}
            <SubmitSuccessModal
                incident={submittedIncident}
                onClose={() => setSubmittedIncident(null)}
            />
        </>
    );
}

export default IncidentEntry;