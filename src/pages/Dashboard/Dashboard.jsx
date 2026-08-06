import { useEffect, useRef, useState } from "react";
import "./Dashboard.css";

import Navbar from "../../components/Navbar/Navbar";
import StatCard from "../../components/StatCard/StatCard";
import DashboardCard from "../../components/DashboardCard/DashboardCard";
import ActivityFeed from "../../components/ActivityFeed/ActivityFeed";
import { api } from "../../lib/api";

import {
    FaExclamationTriangle,
    FaCarCrash,
    FaUsers
} from "react-icons/fa";

const POLL_INTERVAL_MS = 8000;

function Dashboard() {
    const [stats, setStats] = useState(null);
    const [activity, setActivity] = useState([]);
    const [lastUpdated, setLastUpdated] = useState(null);
    const pollRef = useRef(null);

    function refreshAll() {
        Promise.all([api.getDashboardStats(), api.getRecentActivity()])
            .then(([statsData, activityData]) => {
                setStats(statsData);
                setActivity(activityData);
                setLastUpdated(new Date());
            })
            .catch(() => {
                // Keep showing the last known good data on a transient network hiccup
                // rather than wiping the dashboard blank.
            });
    }

    useEffect(() => {
        refreshAll();

        pollRef.current = setInterval(refreshAll, POLL_INTERVAL_MS);

        function handleVisibility() {
            if (document.visibilityState === "visible") {
                refreshAll();
            }
        }
        document.addEventListener("visibilitychange", handleVisibility);

        return () => {
            clearInterval(pollRef.current);
            document.removeEventListener("visibilitychange", handleVisibility);
        };
    }, []);

    return (
        <>
            <Navbar />

            <div className="dashboard-content">

                <div className="eyebrow">
                    <span className="pulse-dot" />
                    System Status: Operational
                    {lastUpdated && (
                        <span className="eyebrow-updated">
                            · Updated {lastUpdated.toLocaleTimeString(undefined, {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                            })}
                        </span>
                    )}
                </div>

                <h1>Welcome back, Admin</h1>

                <p>Monitoring live incidents and breakdowns across the network.</p>

                <div className="stats-grid">
                    <StatCard
                        title="Active Stops"
                        value={stats ? stats.active_stops : "—"}
                        icon={<FaExclamationTriangle />}
                        color="#2DD4CE"
                    />
                    <StatCard
                        title="Today's Breakdowns"
                        value={stats ? stats.todays_breakdowns : "—"}
                        icon={<FaCarCrash />}
                        color="#EF4444"
                    />
                    <StatCard
                        title="Total Clients"
                        value={stats ? stats.total_clients : "—"}
                        icon={<FaUsers />}
                        color="#F5A524"
                    />
                </div>

                <DashboardCard />

                <ActivityFeed items={activity} />

            </div>
        </>
    );
}

export default Dashboard;