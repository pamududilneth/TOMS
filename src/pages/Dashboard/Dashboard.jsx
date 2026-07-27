import "./Dashboard.css";

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
        <>
            <Navbar />

            <div className="dashboard-content">

                <div className="eyebrow">
                    <span className="pulse-dot" />
                    System Status: Operational
                </div>

                <h1>Welcome back, Admin</h1>

                <p>Monitoring 14 live routes across the network.</p>

                <div className="stats-grid">
                    <StatCard title="Active Stops" value="124" icon={<FaExclamationTriangle />} color="#2DD4CE" />
                    <StatCard title="Today's Breakdowns" value="3" icon={<FaCarCrash />} color="#EF4444" />
                    <StatCard title="Total Clients" value="892" icon={<FaUsers />} color="#F5A524" />
                </div>

                <DashboardCard />

            </div>
        </>
    );
}

export default Dashboard;