import "./StatCard.css";

function StatCard({ title, value, icon, color }) {
    return (
        <div className="stat-card">

            <div className="stat-left">

                <h4>{title}</h4>

                <h2>{value}</h2>

            </div>

            <div
                className="stat-icon"
                style={{ "--stat-color": color }}
            >
                {icon}
            </div>

        </div>
    );
}

export default StatCard;