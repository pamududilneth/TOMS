import { NavLink } from "react-router-dom";
import "./Sidebar.css";
import logo from "../../assets/images/OKI DOKI BADGE.png";

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
    const menu = [
        { title: "Stop Management", icon: <FiAlertTriangle />, to: "/stop-management" },
        { title: "Breakdowns", icon: <FiClipboard />, to: "/breakdowns" },
        { title: "Reports", icon: <FiFileText />, to: "/reports" },
        { title: "Clients", icon: <FiUsers />, to: "/clients" },
        { title: "Settings", icon: <FiSettings />, to: "/settings" }
    ];

    return (
        <div className="sidebar">
            <NavLink to="/" className="logo">
                <img src={logo} alt="Company Logo" className="logo-image" />
                <span>Enterprise Resource Control</span>
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
                <div className="menu-item">
                    <FiHelpCircle />
                    <span>Help Center</span>
                </div>
                <div className="menu-item">
                    <FiLogOut />
                    <span>Log Out</span>
                </div>
            </div>
        </div>
    );
}

export default Sidebar;