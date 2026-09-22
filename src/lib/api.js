const BASE = import.meta.env.VITE_API_BASE || "/api";
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

async function loginWithMicrosoft(idToken) {
    const res = await fetch(`${BASE}/auth/microsoft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: idToken }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Microsoft sign-in failed");
    }

    return res.json();
}

export const api = {
    login,
    loginWithMicrosoft,
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
    // createBreakdown: (formData) => requestForm("/breakdowns/", formData),
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
    deleteIncident: (id) => request(`/incidents/${id}`, { method: "DELETE" }),
    deleteBreakdown: (id) => request(`/breakdowns/${id}`, { method: "DELETE" }),
    listStopCategories: () => request("/stop-categories"),
    listStopCategoriesFull: () => request("/stop-categories/full"),
    createStopCategory: (data) => request("/stop-categories", { method: "POST", body: JSON.stringify(data) }),
    deleteStopCategory: (id) => request(`/stop-categories/${id}`, { method: "DELETE" }),
    listSuppliers: () => request("/suppliers"),
    listSuppliersFull: () => request("/suppliers/full"),
    createSupplier: (data) => request("/suppliers", { method: "POST", body: JSON.stringify(data) }),
    deleteSupplier: (id) => request(`/suppliers/${id}`, { method: "DELETE" }),
    createBreakdown: (data) => request("/breakdowns/", { method: "POST", body: JSON.stringify(data) }),
};