import { useState, useEffect } from "react";
import "./UsersPanel.css";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { FiPlus, FiTrash2 } from "react-icons/fi";

const emptyForm = {
    username: "",
    password: "",
    full_name: "",
    role: "staff",
};

function UsersPanel() {
    const { user: currentUser } = useAuth();

    const [users, setUsers] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    function loadUsers() {
        api.listUsers().then(setUsers).catch(() => setUsers([]));
    }

    useEffect(() => {
        loadUsers();
    }, []);

    function updateField(key, value) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    async function handleAdd() {
        setError(null);

        if (!form.username.trim() || !form.password.trim()) {
            setError("Username and password are required.");
            return;
        }

        setSubmitting(true);
        try {
            await api.createUser(form);
            setForm(emptyForm);
            loadUsers();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    async function handleToggleActive(u) {
        setError(null);
        try {
            await api.updateUser(u.id, { is_active: !u.is_active });
            loadUsers();
        } catch (err) {
            setError(err.message);
        }
    }

    async function handleDelete(u) {
        setError(null);
        try {
            await api.deleteUser(u.id);
            loadUsers();
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div className="users-panel">
            <div className="users-panel-header">
                <h3>User Accounts</h3>
                <span className="users-count">{users.length} total</span>
            </div>

            <div className="users-add-row">
                <input
                    type="text"
                    placeholder="Username"
                    value={form.username}
                    onChange={(e) => updateField("username", e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) => updateField("password", e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Full name (optional)"
                    value={form.full_name}
                    onChange={(e) => updateField("full_name", e.target.value)}
                />
                <select
                    value={form.role}
                    onChange={(e) => updateField("role", e.target.value)}
                >
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                </select>
                <button type="button" onClick={handleAdd} disabled={submitting}>
                    <FiPlus />
                    Add
                </button>
            </div>

            {error && <p className="users-error">{error}</p>}

            <div className="users-list">
                <div className="users-list-head">
                    <span>Username</span>
                    <span>Full Name</span>
                    <span>Role</span>
                    <span>Status</span>
                    <span></span>
                </div>

                {users.length === 0 && (
                    <p className="users-empty">No users yet — add one above.</p>
                )}

                {users.map((u) => {
                    const isSelf = currentUser && u.id === currentUser.id;
                    return (
                        <div className="users-list-row" key={u.id}>
                            <span>{u.username}</span>
                            <span>{u.full_name || "—"}</span>
                            <span className={`role-badge role-${u.role}`}>{u.role}</span>

                            <button
                                type="button"
                                className={`status-toggle ${u.is_active ? "active" : "inactive"}`}
                                onClick={() => handleToggleActive(u)}
                                disabled={isSelf}
                                title={isSelf ? "You cannot deactivate your own account" : "Toggle active status"}
                            >
                                {u.is_active ? "Active" : "Disabled"}
                            </button>

                            <button
                                type="button"
                                className="users-delete-btn"
                                onClick={() => handleDelete(u)}
                                disabled={isSelf}
                                title={isSelf ? "You cannot delete your own account" : "Delete user"}
                            >
                                <FiTrash2 />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default UsersPanel;