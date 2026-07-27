import "./Sidebar.css";
import {
    FaExclamationTriangle,
    FaCarCrash,
    FaFileAlt,
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
            icon: <FaCarCrash />
        },
        {
            title: "Reports",
            icon: <FaFileAlt />
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

                <span>Enterprise Resource Controller</span>

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