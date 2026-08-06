import "./ReportField.css";

function ReportField({ label, value, fullWidth = false }) {
    return (
        <div className={`report-field ${fullWidth ? "full-width" : ""}`}>
            <span className="report-field-label">{label}</span>
            <span className="report-field-value">
                {value === null || value === undefined || value === "" ? "—" : String(value)}
            </span>
        </div>
    );
}

export default ReportField;