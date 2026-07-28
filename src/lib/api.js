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
};