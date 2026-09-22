import "./Footer.css";
import companyLog from "../../assets/images/OKI-DOKI-BADGE.png";

function Footer() {
    return (
        <footer className="app-footer">
            <span className="app-footer-text">TOMS &middot; v1.0</span>
            <img src={companyLog} alt="OKI-DOKI" className="app-footer-logo" />

        </footer>
    );
}

export default Footer;