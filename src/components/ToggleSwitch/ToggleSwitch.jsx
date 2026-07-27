import "./ToggleSwitch.css";

function ToggleSwitch({ checked, onChange, label }) {
    return (
        <div className="toggle-row">
            {label && <span className="toggle-label">{label}</span>}
            <button
                type="button"
                className={`toggle-switch ${checked ? "on" : ""}`}
                onClick={() => onChange?.(!checked)}
                aria-pressed={checked}
            >
                <span className="toggle-knob" />
            </button>
        </div>
    );
}

export default ToggleSwitch;