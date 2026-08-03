const BASE = "/api";
const TOKEN_KEY = "toms_token";

function authHeaders() {
    const token = localStorage.getItem(TOKEN_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
    const res = await fetch(`${BASE}${path}`, {
        headers: { "Content-Type": "application/json", ...authHeaders() },
        ...options,
    });

    if (res.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem("toms_user");
        window.location.href = "/login";
        throw new Error("Session expired. Please log in again.");
    }

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Request failed: ${res.status}`);
    }

    return res.json();
}

async function requestForm(path, formData) {
    const res = await fetch(`${BASE}${path}`, {
        method: "POST",
        headers: { ...authHeaders() },
        body: formData,
    });

    if (res.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem("toms_user");
        window.location.href = "/login";
        throw new Error("Session expired. Please log in again.");
    }

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Request failed: ${res.status}`);
    }

    return res.json();
}

async function login(username, password) {
    const body = new URLSearchParams();
    body.append("username", username);
    body.append("password", password);

    const res = await fetch(`${BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
    });

    if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.detail || "Login failed");
    }

    return res.json();
}

export const api = {
    login,
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
    listUsers: () => request("/users/"),
    createUser: (data) => request("/users/", { method: "POST", body: JSON.stringify(data) }),
    updateUser: (id, data) => request(`/users/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    deleteUser: (id) => request(`/users/${id}`, { method: "DELETE" }),
    getIncident: (id) => request(`/incidents/${id}`),
    getBreakdown: (id) => request(`/breakdowns/${id}`),
    updateBreakdown: (id, data) => request(`/breakdowns/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    replaceBreakdownImage: (id, formData) => requestForm(`/breakdowns/${id}/image`, formData),
};