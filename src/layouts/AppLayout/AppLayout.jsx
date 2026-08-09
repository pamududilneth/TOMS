import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar/Sidebar";
import Footer from "../../components/Footer/Footer";
import "./AppLayout.css";

function AppLayout() {
    return (
        <div className="app-shell">
            <Sidebar />
            <div className="page-content">
                <Outlet />
                <Footer />
            </div>
        </div>
    );
}

export default AppLayout;