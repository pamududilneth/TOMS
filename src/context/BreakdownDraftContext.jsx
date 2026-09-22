import { createContext, useContext, useState } from "react";

const STORAGE_KEY = "toms_breakdown_draft";

export const emptyBreakdownForm = {
    incident_datetime: "",
    job_no: "",
    customer_id: "",
    vehicle_number: "",
    driver: "",
    supplier_id: "",
    category: "",
    category_detail: "",
    injury_category: "",
    root_cause: "",
    shipment_content: "",
    third_party_life: "",
    driver_assistant_life: "",
    vehicle_impact: "",
    third_party_property: "",
    delivery_on_time: "",
    involvement_of_police: "",
    legal_impact: "",
};

function loadDraft() {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : emptyBreakdownForm;
    } catch {
        return emptyBreakdownForm;
    }
}

const BreakdownDraftContext = createContext(null);

export function BreakdownDraftProvider({ children }) {
    const [form, setFormState] = useState(loadDraft);

    function setForm(updater) {
        setFormState((prev) => {
            const next = typeof updater === "function" ? updater(prev) : updater;
            try {
                sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            } catch { }
            return next;
        });
    }

    function resetForm() {
        setFormState(emptyBreakdownForm);
        try {
            sessionStorage.removeItem(STORAGE_KEY);
        } catch { }
    }

    return (
        <BreakdownDraftContext.Provider value={{ form, setForm, resetForm }}>
            {children}
        </BreakdownDraftContext.Provider>
    );
}

export function useBreakdownDraft() {
    return useContext(BreakdownDraftContext);
}