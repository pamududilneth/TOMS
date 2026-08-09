import { useState, useEffect } from "react";
import "../SubmitSuccessModal/SubmitSuccessModal.css";
import { copyBreakdownTableToClipboard } from "../../utils/clipboardCopy";
import { FiCheckCircle, FiCopy, FiX } from "react-icons/fi";

function BreakdownSuccessModal({ breakdown, onClose }) {
    const [copyStatus, setCopyStatus] = useState("");

    useEffect(() => {
        function handleEscape(e) {
            if (e.key === "Escape") onClose();
        }
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [onClose]);

    if (!breakdown) return null;

    async function handleCopyForEmail() {
        try {
            const result = await copyBreakdownTableToClipboard(breakdown);
            setCopyStatus(
                result.hasImage
                    ? "Copied with image! Paste into your Outlook email."
                    : "Copied (no image found). Paste into your Outlook email."
            );
        } catch (err) {
            console.error("[copy] Clipboard write failed:", err);
            setCopyStatus("Copy failed — try again.");
        }
        setTimeout(() => setCopyStatus(""), 4000);
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

                <h2>Breakdown Submitted</h2>
                <p className="submit-modal-subtitle">
                    <strong>{breakdown.job_number}</strong> has been saved successfully.
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

export default BreakdownSuccessModal;