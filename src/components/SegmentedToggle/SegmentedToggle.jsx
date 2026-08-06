import "./SegmentedToggle.css";

function SegmentedToggle({ options = ["Yes", "No"], value, onChange, label }) {
    return (
        <div className="segmented-field">
            {label && <span className="segmented-label">{label}</span>}
            <div className="segmented-toggle">
                {options.map((opt) => (
                    <button
                        type="button"
                        key={opt}
                        className={value === opt ? "active" : ""}
                        onClick={() => onChange?.(opt)}
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default SegmentedToggle;