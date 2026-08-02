const BASE = "/api";

async function request(path, options = {}) {
    const res = await fetch(`${BASE}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...options,
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Request failed: ${res.status}`);
    }

    return res.json();
}

export const api = {
    getDashboardStats: () => request("/stats/dashboard"),
    getNextRequestId: () => request("/incidents/next-id"),
    listIncidents: () => request("/incidents/"),
    createIncident: (data) =>
        request("/incidents/", { method: "POST", body: JSON.stringify(data) }),
    updateIncident: (id, data) =>
        request(`/incidents/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    listClients: (q = "") => request(`/clients?q=${encodeURIComponent(q)}`),
    listCoordinators: () => request("/coordinators"),
    getNextJobNumber: () => request("/breakdowns/next-id"),
    listBreakdowns: () => request("/breakdowns/"),
    createBreakdown: (formData) => requestForm("/breakdowns/", formData),
    getRecentActivity: () => request("/stats/recent-activity"),
    listCoordinatorsFull: () => request("/coordinators/full"),
    createCoordinator: (data) => request("/coordinators", { method: "POST", body: JSON.stringify(data) }),
    deleteCoordinator: (id) => request(`/coordinators/${id}`, { method: "DELETE" }),
    createClient: (data) => request("/clients", { method: "POST", body: JSON.stringify(data) }),
    deleteClient: (id) => request(`/clients/${id}`, { method: "DELETE" }),
    listClientsFull: () => request("/clients/full"),
    getClientDetail: (id) => request(`/clients/${id}`),
};

async function requestForm(path, formData) {
    const res = await fetch(`${BASE}${path}`, {
        method: "POST",
        body: formData,
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Request failed: ${res.status}`);
    }

    return res.json();
}