import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar/Sidebar";
import "./AppLayout.css";

function AppLayout() {
    return (
        <div className="app-shell">
            <Sidebar />
            <div className="page-content">
                <Outlet />
            </div>
        </div>
    );
}

export default AppLayout;