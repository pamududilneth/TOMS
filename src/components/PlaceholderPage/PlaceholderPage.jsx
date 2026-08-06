import Topbar from "../Topbar/Topbar";
import "./PlaceholderPage.css";

function PlaceholderPage({ title, description }) {
    return (
        <>
            <Topbar title={title} />
            <div className="placeholder-page">
                <div className="placeholder-card">
                    <h2>{title}</h2>
                    <p>{description}</p>
                </div>
            </div>
        </>
    );
}

export default PlaceholderPage;