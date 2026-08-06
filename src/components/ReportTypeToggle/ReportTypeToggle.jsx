import "./ReportTypeToggle.css";
import { FiAlertTriangle, FiTruck } from "react-icons/fi";

function ReportTypeToggle({ value, onChange }) {
    return (
        <div className="report-type-toggle">
            <button
                type="button"
                className={value === "incidents" ? "active" : ""}
                onClick={() => onChange("incidents")}
            >
                <FiAlertTriangle />
                Stop Management
            </button>
            <button
                type="button"
                className={value === "breakdowns" ? "active" : ""}
                onClick={() => onChange("breakdowns")}
            >
                <FiTruck />
                Vehicle Breakdown
            </button>
        </div>
    );
}

export default ReportTypeToggle;