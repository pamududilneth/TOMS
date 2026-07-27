import "./DashboardCard.css";
import dashboardImage from "../../assets/images/dashboard.jpg";
import { FaChartBar } from "react-icons/fa";

function DashboardCard() {
    return (
        <div className="feature-grid">

            {/* Left Large Card */}

            <div className="feature-card">

                <div className="feature-media">

                    <img
                        src={dashboardImage}
                        alt="Live traffic camera monitoring an unplanned stop"
                    />

                    <span className="live-tag">
                        <span className="pulse-dot" />
                        LIVE
                    </span>

                </div>

                <div className="feature-copy">

                    <span className="badge badge-critical">
                        7 Critical Alerts
                    </span>

                    <h2>Unplanned Stop Management</h2>

                    <p>
                        Real-time monitoring and rerouting for unexpected
                        route deviations. Maintain service SLAs with
                        proactive intervention.
                    </p>

                    <button className="btn-primary">
                        Manage Now
                    </button>

                </div>

            </div>

            {/* Right Card */}

            <div className="report-card">

                <div>

                    <div className="report-icon">
                        <FaChartBar />
                    </div>

                    <h3>Operational Reports</h3>

                    <p>
                        Generate automated weekly efficiency audits and
                        resource utilization summaries.
                    </p>

                </div>

                <button className="btn-secondary">
                    Generate Report
                </button>

            </div>

        </div>
    );
}

export default DashboardCard;