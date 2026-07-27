import "./FormSection.css";

function FormSection({ icon, iconColor = "blue", title, children }) {
    return (
        <div className="form-section">
            <div className="form-section-header">
                <span className={`section-icon icon-${iconColor}`}>{icon}</span>
                <h3>{title}</h3>
            </div>
            <div className="form-section-body">{children}</div>
        </div>
    );
}

export default FormSection;