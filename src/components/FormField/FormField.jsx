import "./FormField.css";

function FormField({
    label,
    required = false,
    type = "text",
    placeholder,
    helper,
    icon,
    options,
    value,
    onChange,
    readOnly = false,
    ...rest
}) {
    return (
        <div className="field">
            {label && (
                <label>
                    {label}
                    {required && <span className="req">*</span>}
                </label>
            )}

            <div className={`field-control ${icon ? "has-icon" : ""} ${readOnly ? "field-readonly" : ""}`}>
                {icon && <span className="field-icon">{icon}</span>}

                {type === "select" ? (
                    <select value={value} onChange={onChange} {...rest}>
                        <option value="">{placeholder}</option>
                        {options?.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                ) : type === "textarea" ? (
                    <textarea placeholder={placeholder} value={value} onChange={onChange} readOnly={readOnly} {...rest} />
                ) : (
                    <input type={type} placeholder={placeholder} value={value} onChange={onChange} readOnly={readOnly} {...rest} />
                )}
            </div>

            {helper && <span className="field-helper">{helper}</span>}
        </div>
    );
}

export default FormField;