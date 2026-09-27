import "./FormFooterActions.css";

function FormFooterActions({
    onDiscard,
    onSubmit,
    submitting = false,
    discardLabel = "Discard Draft",
    submitLabel = "Submit Report",
    submittingLabel = "Submitting...",
}) {
    return (
        <div className="form-footer-actions">
            <button type="button" className="btn-outline" onClick={onDiscard} disabled={submitting}>
                {discardLabel}
            </button>
            <button type="button" className="btn-dark" onClick={onSubmit} disabled={submitting}>
                {submitting ? submittingLabel : submitLabel}
            </button>
        </div>
    );
}

export default FormFooterActions;