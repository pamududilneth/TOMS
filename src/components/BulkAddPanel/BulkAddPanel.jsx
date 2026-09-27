import { useState } from "react";
import "./BulkAddPanel.css";
import { FiUpload, FiX } from "react-icons/fi";

function BulkAddPanel({ onSubmit, label = "items" }) {
    const [open, setOpen] = useState(false);
    const [text, setText] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);

    // Splits on newlines, tabs, or commas — covers pasting a single Excel
    // column (newlines) or a row (tabs/commas) without extra cleanup.
    function parseNames(raw) {
        return raw
            .split(/[\n\t,]+/)
            .map((s) => s.trim())
            .filter((s) => s.length > 0);
    }

    const preview = parseNames(text);

    async function handleSubmit() {
        const names = parseNames(text);
        if (names.length === 0) return;

        setSubmitting(true);
        setResult(null);
        try {
            const outcome = await onSubmit(names);
            setResult(outcome);
            if (outcome.failed.length === 0) {
                setText("");
            }
        } finally {
            setSubmitting(false);
        }
    }

    function handleClose() {
        setOpen(false);
        setText("");
        setResult(null);
    }

    if (!open) {
        return (
            <button type="button" className="bulk-add-trigger" onClick={() => setOpen(true)}>
                <FiUpload />
                Bulk Add
            </button>
        );
    }

    return (
        <div className="bulk-add-panel">
            <div className="bulk-add-header">
                <span>Paste a column of {label} (one per line)</span>
                <button type="button" className="bulk-add-close" onClick={handleClose}>
                    <FiX />
                </button>
            </div>

            <textarea
                className="bulk-add-textarea"
                placeholder={`Paste from Excel here — e.g.\nAcme Logistics\nBlue Ocean Freight\nCoastal Distributors`}
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={8}
            />

            <div className="bulk-add-footer">
                <span className="bulk-add-count">
                    {preview.length > 0 ? `${preview.length} ${label} detected` : "Paste content above"}
                </span>
                <button
                    type="button"
                    className="bulk-add-submit"
                    onClick={handleSubmit}
                    disabled={submitting || preview.length === 0}
                >
                    {submitting ? "Adding..." : `Add ${preview.length || ""} ${label}`}
                </button>
            </div>

            {result && (
                <div className="bulk-add-result">
                    <p className="bulk-add-success">✓ Added {result.added.length} new {label}</p>
                    {result.duplicates.length > 0 && (
                        <p className="bulk-add-duplicate">
                            ⚠ Skipped {result.duplicates.length} already existing: {result.duplicates.join(", ")}
                        </p>
                    )}
                    {result.failed.length > 0 && (
                        <p className="bulk-add-error">
                            ✗ Failed to add {result.failed.length}: {result.failed.join(", ")}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

export default BulkAddPanel;