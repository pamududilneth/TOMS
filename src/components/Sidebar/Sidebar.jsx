import "./Sidebar.css";
import {
    FaExclamationTriangle,
    FaClipboardList,
    FaUsers,
    FaCog,
    FaQuestionCircle,
    FaSignOutAlt
} from "react-icons/fa";

function Sidebar() {

    const menu = [
        {
            title: "Stop Management",
            icon: <FaExclamationTriangle />,
            active: true
        },
        {
            title: "Breakdowns",
            icon: <FaClipboardList />
        },
        {
            title: "Reports",
            icon: <FaClipboardList />
        },
        {
            title: "Clients",
            icon: <FaUsers />
        },
        {
            title: "Settings",
            icon: <FaCog />
        }
    ];

    return (

        <div className="sidebar">

            <div className="logo">

                <h2>TOMS</h2>

                <span>Antigravity</span>

            </div>

            <div className="menu">

                {

                    menu.map((item, index) => (

                        <div
                            key={index}
                            className={`menu-item ${item.active ? "active" : ""}`}
                        >

                            <span className="icon">

                                {item.icon}

                            </span>

                            <span>

                                {item.title}

                            </span>

                        </div>

                    ))

                }

            </div>

            <div className="bottom">

                <div className="menu-item">

                    <FaQuestionCircle />

                    <span>Help Center</span>

                </div>

                <div className="menu-item">

                    <FaSignOutAlt />

                    <span>Log Out</span>

                </div>

            </div>

        </div>

    );

}

export default Sidebar;