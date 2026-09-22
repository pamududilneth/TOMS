import { createContext, useContext, useState } from "react";

const STORAGE_KEY = "toms_incident_draft";

export const emptyIncidentForm = {
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

function loadDraft() {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : emptyIncidentForm;
    } catch {
        return emptyIncidentForm;
    }
}

const IncidentDraftContext = createContext(null);

export function IncidentDraftProvider({ children }) {
    const [form, setFormState] = useState(loadDraft);

    function setForm(updater) {
        setFormState((prev) => {
            const next = typeof updater === "function" ? updater(prev) : updater;
            try {
                sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            } catch {
                // sessionStorage unavailable — form still works, just won't survive a refresh
            }
            return next;
        });
    }

    function resetForm() {
        setFormState(emptyIncidentForm);
        try {
            sessionStorage.removeItem(STORAGE_KEY);
        } catch { }
    }

    return (
        <IncidentDraftContext.Provider value={{ form, setForm, resetForm }}>
            {children}
        </IncidentDraftContext.Provider>
    );
}

export function useIncidentDraft() {
    return useContext(IncidentDraftContext);
}