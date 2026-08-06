import { useState, useEffect } from "react";
import "./SubmitSuccessModal.css";
import { buildSingleIncidentTableHTML } from "../../utils/reportTable";
import { FiCheckCircle, FiCopy, FiX } from "react-icons/fi";

function SubmitSuccessModal({ incident, onClose }) {
    const [copyStatus, setCopyStatus] = useState("");

    useEffect(() => {
        function handleEscape(e) {
            if (e.key === "Escape") onClose();
        }
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [onClose]);

    if (!incident) return null;

    async function handleCopyForEmail() {
        const html = buildSingleIncidentTableHTML(incident, { standalone: false });
        const plain = `Incident Report — ${incident.request_id}`;

        try {
            if (navigator.clipboard && window.ClipboardItem) {
                const item = new ClipboardItem({
                    "text/html": new Blob([html], { type: "text/html" }),
                    "text/plain": new Blob([plain], { type: "text/plain" }),
                });
                await navigator.clipboard.write([item]);
            } else {
                await navigator.clipboard.writeText(plain);
            }
            setCopyStatus("Copied! Paste into your Outlook email.");
        } catch {
            setCopyStatus("Copy failed — try again.");
        }

        setTimeout(() => setCopyStatus(""), 3500);
    }

    return (
        <div className="submit-modal-backdrop" onClick={onClose}>
            <div className="submit-modal-card" onClick={(e) => e.stopPropagation()}>

                <button type="button" className="submit-modal-close" onClick={onClose}>
                    <FiX />
                </button>

                <div className="submit-modal-icon">
                    <FiCheckCircle />
                </div>

                <h2>Incident Submitted</h2>
                <p className="submit-modal-subtitle">
                    <strong>{incident.request_id}</strong> has been saved successfully.
                </p>

                <button type="button" className="submit-modal-copy-btn" onClick={handleCopyForEmail}>
                    <FiCopy />
                    Copy Table for Email
                </button>

                {copyStatus && <p className="submit-modal-status">{copyStatus}</p>}

                <button type="button" className="submit-modal-done-btn" onClick={onClose}>
                    Done
                </button>

            </div>
        </div>
    );
}

export default SubmitSuccessModal;