import { useState } from "react";
import "./SettingsTable.css";
import { FiPlus, FiTrash2 } from "react-icons/fi";

function SettingsTable({ title, columns, rows, onAdd, onDelete, addFields }) {
    const [formValues, setFormValues] = useState(
        Object.fromEntries(addFields.map((f) => [f.key, ""]))
    );
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    function updateField(key, value) {
        setFormValues((prev) => ({ ...prev, [key]: value }));
    }

    async function handleAdd() {
        setError(null);

        const requiredMissing = addFields.some(
            (f) => f.required && !formValues[f.key]?.trim()
        );
        if (requiredMissing) {
            setError("Please fill in all required fields.");
            return;
        }

        setSubmitting(true);
        try {
            await onAdd(formValues);
            setFormValues(Object.fromEntries(addFields.map((f) => [f.key, ""])));
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="settings-table">
            <div className="settings-table-header">
                <h3>{title}</h3>
                <span className="settings-count">{rows.length} total</span>
            </div>

            <div className="settings-add-row">
                {addFields.map((f) => (
                    <input
                        key={f.key}
                        type={f.type || "text"}
                        placeholder={f.placeholder}
                        value={formValues[f.key]}
                        onChange={(e) => updateField(f.key, e.target.value)}
                    />
                ))}
                <button
                    type="button"
                    className="settings-add-btn"
                    onClick={handleAdd}
                    disabled={submitting}
                >
                    <FiPlus />
                    Add
                </button>
            </div>

            {error && <p className="settings-error">{error}</p>}

            <div className="settings-list">
                <div className="settings-list-head">
                    {columns.map((c) => (
                        <span key={c.key}>{c.label}</span>
                    ))}
                    <span></span>
                </div>

                {rows.length === 0 && (
                    <p className="settings-empty">No entries yet — add one above.</p>
                )}

                {rows.map((row) => (
                    <div className="settings-list-row" key={row.id}>
                        {columns.map((c) => (
                            <span key={c.key}>{row[c.key] || "—"}</span>
                        ))}
                        <button
                            type="button"
                            className="settings-delete-btn"
                            onClick={() => onDelete(row.id)}
                            title="Delete"
                        >
                            <FiTrash2 />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SettingsTable;