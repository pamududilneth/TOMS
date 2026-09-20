import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";
import { useAuth } from "../../context/AuthContext";
import { useMsal } from "@azure/msal-react";
import companyLogo from "../../assets/images/oki-doki-logo.png";
import {
    FiAlertTriangle,
    FiClipboard,
    FiFileText,
    FiUsers,
    FiSettings,
    FiHelpCircle,
    FiLogOut
} from "react-icons/fi";

function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // MSAL instance for handling Microsoft sessions
    const { instance, accounts } = useMsal();

    // 1. Remove "Clients" from the default menu array so staff won't see it
    const menu = [
        { title: "Stop Management", icon: <FiAlertTriangle />, to: "/stop-management" },
        { title: "Breakdowns/Accidents", icon: <FiClipboard />, to: "/breakdowns" },
        { title: "Reports", icon: <FiFileText />, to: "/reports" },
    ];

    // 2. Add "Clients" and "Settings" to the menu ONLY if the user is an admin
    if (user?.role === "admin") {
        menu.push({ title: "Clients", icon: <FiUsers />, to: "/clients" });
        menu.push({ title: "Settings", icon: <FiSettings />, to: "/settings" });
    }

    function handleLogout() {
        logout(); // clears your app's own JWT/localStorage session

        if (accounts.length > 0) {
            // Also clears MSAL's cached Microsoft session, so returning to
            // /login doesn't silently auto-sign-in again
            instance.logoutRedirect({
                account: accounts[0],
                postLogoutRedirectUri: window.location.origin + "/login",
            });
        } else {
            navigate("/login");
        }
    }

    return (
        <div className="sidebar">
            <NavLink to="/" className="logo">
                <img src={companyLogo} alt="Company Logo" className="logo-image" />
            </NavLink>

            <div className="menu">
                {menu.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}
                    >
                        <span className="icon">{item.icon}</span>
                        <span>{item.title}</span>
                    </NavLink>
                ))}
            </div>

            <div className="bottom">
                {user && (
                    <div className="sidebar-user">
                        <span className="sidebar-user-name">{user.full_name || user.username}</span>
                        <span className="sidebar-user-role">{user.role}</span>
                    </div>
                )}
                <div className="menu-item">
                    <FiHelpCircle />
                    <span>Help Center</span>
                </div>
                <div className="menu-item" onClick={handleLogout}>
                    <FiLogOut />
                    <span>Log Out</span>
                </div>
            </div>
        </div>
    );
}

export default Sidebar;