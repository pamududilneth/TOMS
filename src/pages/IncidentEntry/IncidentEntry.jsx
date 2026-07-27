import { useState } from "react";
import "./IncidentEntry.css";

import Sidebar from "../../components/Sidebar/Sidebar";
import Topbar from "../../components/Topbar/Topbar";
import PageToolbar from "../../components/PageToolbar/PageToolbar";
import FormSection from "../../components/FormSection/FormSection";
import FormField from "../../components/FormField/FormField";
import SegmentedToggle from "../../components/SegmentedToggle/SegmentedToggle";
import ToggleSwitch from "../../components/ToggleSwitch/ToggleSwitch";

import {
    FiAlertTriangle,
    FiUser,
    FiMapPin,
    FiFileText,
    FiCheckCircle,
    FiClock,
    FiGrid
} from "react-icons/fi";

function IncidentEntry() {
    const [driverContacted, setDriverContacted] = useState("Yes");
    const [vehicleParked, setVehicleParked] = useState(false);

    return (
        <div className="app-shell">
            <Sidebar />

            <div className="page-content">
                <Topbar title="Operations Dashboard" />

                <PageToolbar
                    crumbs={["Operational Control", "Unplanned Stop Management"]}
                    subtitle="New Incident Entry"
                    onDiscard={() => { }}
                    onSubmit={() => { }}
                />

                <div className="incident-entry-grid">

                    <div className="form-main">

                        <FormSection icon={<FiAlertTriangle />} iconColor="red" title="Incident & Vehicle Info">
                            <div className="form-row">
                                <FormField
                                    label="Request ID"
                                    value="REQ-2024-00892"
                                    readOnly
                                    helper="System generated unique identifier"
                                />
                                <FormField label="Vehicle Number" required placeholder="e.g. MH 12 AB 1234" />
                            </div>
                        </FormSection>

                        <FormSection icon={<FiUser />} iconColor="blue" title="Personnel Details">
                            <div className="form-row">
                                <FormField label="Driver Name" required placeholder="Enter driver name" />
                                <FormField label="Driver Contact Number" required placeholder="Enter contact number" />
                            </div>
                            <div className="form-row">
                                <FormField
                                    label="Assigned Coordinator"
                                    type="select"
                                    placeholder="Select Coordinator"
                                    options={["Coordinator A", "Coordinator B", "Coordinator C"]}
                                />
                                <FormField label="Coordinator Mobile Number" placeholder="Enter mobile number" />
                            </div>
                        </FormSection>

                        <FormSection icon={<FiMapPin />} iconColor="violet" title="Parking & Location">
                            <div className="form-row">
                                <FormField label="Current Parking Location" icon={<FiMapPin />} placeholder="Search coordinates or address..." />
                                <FormField label="Parked Time" icon={<FiClock />} placeholder="--:-- --" />
                            </div>
                            <div className="form-row form-row-3">
                                <FormField label="Pickup Location" placeholder="Enter pickup location" />
                                <FormField label="Via Location(s)" placeholder="Separate with commas" />
                                <FormField label="Delivery Location" placeholder="Enter delivery location" />
                            </div>
                        </FormSection>

                    </div>

                    <div className="form-side">

                        <FormSection icon={<FiFileText />} iconColor="blue" title="Status & Feedback">
                            <SegmentedToggle
                                label="Driver Contacted"
                                options={["Yes", "No"]}
                                value={driverContacted}
                                onChange={setDriverContacted}
                            />
                            <FormField
                                label="Driver Feedback"
                                type="textarea"
                                placeholder="Enter detailed feedback from the driver..."
                            />
                            <ToggleSwitch
                                label="Vehicle Parked"
                                checked={vehicleParked}
                                onChange={setVehicleParked}
                            />
                        </FormSection>

                        <FormSection icon={<FiCheckCircle />} iconColor="green" title="Reporting">
                            <FormField
                                label="Approver"
                                required
                                type="select"
                                placeholder="Select Level 1 Approver"
                                options={["Approver A", "Approver B"]}
                            />
                            <FormField label="Select Client for Report" icon={<FiGrid />} placeholder="Search Client..." />
                        </FormSection>

                        <div className="guideline-box">
                            <div className="guideline-title">
                                <FiFileText />
                                Entry Guidelines
                            </div>
                            <ul>
                                <li>All fields marked * are mandatory</li>
                                <li>Reports generate automatically after submission</li>
                                <li>Ensure location details are accurate</li>
                            </ul>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
}

export default IncidentEntry;