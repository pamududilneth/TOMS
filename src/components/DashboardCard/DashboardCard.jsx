import "./DashboardCard.css";
import dashboardImage from "../../assets/images/dashboard.jpg";

function DashboardCard() {
    return (
        <div className="dashboard-grid">

            {/* Left Large Card */}

            <div className="main-card">

                <img src={dashboardImage} alt="Dashboard" />

                <div className="main-content">

                    <span className="badge">
                        7 CRITICAL ALERTS
                    </span>

                    <h2>Unplanned Stop Management</h2>

                    <p>
                        Real-time monitoring and rerouting for unexpected
                        route deviations. Maintain service SLAs with
                        proactive intervention.
                    </p>

                    <button>
                        Manage Now
                    </button>

                </div>

            </div>

            {/* Right Card */}

            <div className="report-card">

                <div className="report-icon">

                    📊

                </div>

                <h3>Operational Reports</h3>

                <p>

                    Generate automated weekly efficiency audits and
                    resource utilization summaries.

                </p>

                <button>

                    Generate Report

                </button>

            </div>

        </div>
    );
}

export default DashboardCard;