import "./Topbar.css";
import { FiSearch, FiBell, FiRotateCcw, FiHelpCircle } from "react-icons/fi";

function Topbar({ title = "Operations Dashboard" }) {
    return (
        <div className="topbar">
            <div className="topbar-left">
                <span className="topbar-title">{title}</span>
                <div className="topbar-search">
                    <FiSearch />
                    <input type="text" placeholder="Search orders..." />
                </div>
            </div>

            <div className="topbar-right">
                <FiBell className="topbar-icon" />
                <FiRotateCcw className="topbar-icon" />
                <FiHelpCircle className="topbar-icon" />
                <img src="https://i.pravatar.cc/40" alt="profile" className="topbar-avatar" />
            </div>
        </div>
    );
}

export default Topbar;