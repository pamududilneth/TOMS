import "./Sidebar.css";
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
        { title: "Stop Management", icon: <FiAlertTriangle />, active: true },
        { title: "Breakdowns", icon: <FiClipboard /> },
        { title: "Reports", icon: <FiFileText /> },
        { title: "Clients", icon: <FiUsers /> },
        { title: "Settings", icon: <FiSettings /> }
    ];

    return (
        <div className="sidebar">
            <div className="logo">
                <h2>OpsManager Pro</h2>
                <span>Enterprise Resource Control</span>
            </div>

            <div className="menu">
                {menu.map((item, index) => (
                    <div key={index} className={`menu-item ${item.active ? "active" : ""}`}>
                        <span className="icon">{item.icon}</span>
                        <span>{item.title}</span>
                    </div>
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