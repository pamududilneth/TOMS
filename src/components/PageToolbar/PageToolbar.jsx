import "./PageToolbar.css";

function PageToolbar({ crumbs = [], subtitle }) {
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
        </div>
    );
}

export default PageToolbar;


// import "./PageToolbar.css";

// function PageToolbar({
//     crumbs = [],
//     subtitle,
//     onDiscard,
//     onSubmit,
//     submitting = false,
//     discardLabel = "Discard Draft",
//     submitLabel = "Submit Incident Report",
//     submittingLabel = "Submitting...",
// }) {
//     return (
//         <div className="page-toolbar">
//             <div>
//                 <div className="breadcrumb">
//                     {crumbs.map((c, i) => (
//                         <span key={c} className={i === crumbs.length - 1 ? "current" : ""}>
//                             {c}
//                             {i < crumbs.length - 1 && <span className="sep">›</span>}
//                         </span>
//                     ))}
//                 </div>
//                 {subtitle && <p className="page-subtitle">{subtitle}</p>}
//             </div>

//             <div className="toolbar-actions">
//                 <button type="button" className="btn-outline" onClick={onDiscard} disabled={submitting}>
//                     {discardLabel}
//                 </button>
//                 <button type="button" className="btn-dark" onClick={onSubmit} disabled={submitting}>
//                     {submitting ? submittingLabel : submitLabel}
//                 </button>
//             </div>
//         </div>
//     );
// }

// export default PageToolbar;