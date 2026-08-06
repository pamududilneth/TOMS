import "./Navbar.css";
import {
    FaBell,
    FaSyncAlt,
    FaCog,
    FaSearch
} from "react-icons/fa";

function Navbar() {

    return (

        <div className="navbar">

            <div className="navbar-left">

                <div className="search-box">

                    <FaSearch />

                    <input
                        type="text"
                        placeholder="Search operations..."
                    />

                </div>

                <div className="status-pill">
                    <span className="pulse-dot" />
                    System Operational
                </div>

            </div>

            <div className="navbar-right">

                <FaBell className="nav-icon" />

                <FaSyncAlt className="nav-icon" />

                <FaCog className="nav-icon" />

                <img
                    src="https://i.pravatar.cc/40"
                    alt="profile"
                    className="profile"
                />

            </div>

        </div>

    );

}

export default Navbar;