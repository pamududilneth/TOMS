import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import "./SearchableSelect.css";
import { FiChevronDown, FiSearch } from "react-icons/fi";

function SearchableSelect({
    label,
    options,
    value,
    onChange,
    placeholder = "Select...",
    required = false,
    helper,
    helperError = false,
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

    const triggerRef = useRef(null);
    const panelRef = useRef(null);

    function updatePosition() {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        setCoords({
            top: rect.bottom + window.scrollY + 6,
            left: rect.left + window.scrollX,
            width: rect.width,
        });
    }

    function handleOpen() {
        updatePosition();
        setOpen((prev) => !prev);
    }

    useEffect(() => {
        if (!open) return;

        function handleClickOutside(e) {
            if (
                triggerRef.current && !triggerRef.current.contains(e.target) &&
                panelRef.current && !panelRef.current.contains(e.target)
            ) {
                setOpen(false);
                setSearch("");
            }
        }

        function handleReposition() {
            updatePosition();
        }

        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("scroll", handleReposition, true);
        window.addEventListener("resize", handleReposition);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("scroll", handleReposition, true);
            window.removeEventListener("resize", handleReposition);
        };
    }, [open]);

    const filtered = options.filter((opt) =>
        opt.toLowerCase().includes(search.toLowerCase())
    );

    function handleSelect(opt) {
        onChange(opt);
        setOpen(false);
        setSearch("");
    }

    return (
        <div className="field">
            {label && (
                <label>
                    {label}
                    {required && <span className="req">*</span>}
                </label>
            )}

            <div className="searchable-select" ref={triggerRef}>
                <button
                    type="button"
                    className="searchable-select-trigger"
                    onClick={handleOpen}
                >
                    <span className={value ? "" : "searchable-select-placeholder"}>
                        {value || placeholder}
                    </span>
                    <FiChevronDown className={`searchable-select-chevron ${open ? "open" : ""}`} />
                </button>
            </div>

            {open &&
                createPortal(
                    <div
                        ref={panelRef}
                        className="searchable-select-panel"
                        style={{
                            position: "absolute",
                            top: coords.top,
                            left: coords.left,
                            width: coords.width,
                        }}
                    >
                        <div className="searchable-select-search">
                            <FiSearch />
                            <input
                                type="text"
                                autoFocus
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="searchable-select-list">
                            {filtered.length === 0 && (
                                <div className="searchable-select-empty">No matches</div>
                            )}
                            {filtered.map((opt) => (
                                <div
                                    key={opt}
                                    className={`searchable-select-option ${opt === value ? "active" : ""}`}
                                    onClick={() => handleSelect(opt)}
                                >
                                    {opt}
                                </div>
                            ))}
                        </div>
                    </div>,
                    document.body
                )}

            {helper && <span className={`field-helper ${helperError ? "field-helper-error" : ""}`}>{helper}</span>}
        </div>
    );
}

export default SearchableSelect;