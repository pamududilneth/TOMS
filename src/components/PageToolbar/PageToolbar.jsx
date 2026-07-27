import "./PageToolbar.css";

function PageToolbar({ crumbs = [], subtitle, onDiscard, onSubmit }) {
    return (
        <div className="page-toolbar">
            <div>
                <div className="breadcrumb">
                    {crumbs.map((c, i) => (
                        <span key={c} className={i === crumbs.length - 1 ? "current" : ""}>
                            {c}
                            {i < crumbs.length - 1 && <span className="sep">›</span>}
                        </span>
                    ))}
                </div>
                {subtitle && <p className="page-subtitle">{subtitle}</p>}
            </div>

            <div className="toolbar-actions">
                <button type="button" className="btn-outline" onClick={onDiscard}>
                    Discard Draft
                </button>
                <button type="button" className="btn-dark" onClick={onSubmit}>
                    Submit Incident Report
                </button>
            </div>
        </div>
    );
}

export default PageToolbar;