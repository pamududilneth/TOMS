import "./Dashboard.css";

import Sidebar from "../../components/Sidebar/sidebar";
import Navbar from "../../components/Navbar/Navbar";
import StatCard from "../../components/StatCard/StatCard";
import DashboardCard from "../../components/DashboardCard/DashboardCard";

import {
    FaExclamationTriangle,
    FaCarCrash,
    FaUsers
} from "react-icons/fa";

function Dashboard() {

    return (

        <div className="dashboard">

            <Sidebar />

            <div className="main-content">

                <Navbar />

                <div className="dashboard-content">

                    <h1>Welcome back, Admin</h1>

                    <p>
                        System Status: Operational.
                        Monitoring 14 live routes.
                    </p>

                    <div className="stats-grid">

                        <StatCard
                            title="Active Stops"
                            value="124"
                            icon={<FaExclamationTriangle />}
                            color="#2563eb"
                        />

                        <StatCard
                            title="Today's Breakdowns"
                            value="3"
                            icon={<FaCarCrash />}
                            color="#dc2626"
                        />

                        <StatCard
                            title="Total Clients"
                            value="892"
                            icon={<FaUsers />}
                            color="#0ea5e9"
                        />

                    </div>


                    <div className="dashboard-content">

                        <h1>Welcome back, Admin</h1>

                        <p>
                            System Status: Operational.
                            Monitoring 14 live routes.
                        </p>

                        <div className="stats-grid">

                            {/* Stat cards */}

                        </div>

                        <DashboardCard />

                    </div>

                </div>

            </div>

        </div>

    );

}

export default Dashboard;