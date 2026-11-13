import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Topbar.css";
import "../../lib/liquidGlass";
import { FiBell, FiRotateCcw, FiHelpCircle, FiLogOut, FiUser, FiCamera } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

function Topbar({ title = "Operations Dashboard" }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [showProfile, setShowProfile] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [customAvatar, setCustomAvatar] = useState(null);

    const topbarRef = useRef(null);
    const profileRef = useRef(null);
    const notifRef = useRef(null);
    const fileInputRef = useRef(null);

    // Liquid glass: custom lens shaped for a wide pill
    useEffect(() => {
        const el = topbarRef.current;
        const helpers = window.liquidGlassHelpers;
        if (!el || !window.attachLiquidGlass || !helpers) return;

        const { roundedRectSDF, smoothStep, texture } = helpers;

        function pillFragment(uv) {
            const w = el.offsetWidth || 1;
            const h = el.offsetHeight || 1;

            const radius = h / 2;   // full pill
            const band = h * 0.4;   // width (px) of the refraction band along the rim
            const bend = h * 0.35;  // max shift (px) right at the rim

            const x = (uv.x - 0.5) * w;
            const y = (uv.y - 0.5) * h;

            const sdf = (px, py) => roundedRectSDF(px, py, w / 2, h / 2, radius);

            const depth = -sdf(x, y);                     // px inside the rim
            const edge = 1 - smoothStep(0, band, depth);  // 1 at rim -> 0 in the flat middle

            // outward direction = gradient of the distance field
            const gx = sdf(x + 1, y) - sdf(x - 1, y);
            const gy = sdf(x, y + 1) - sdf(x, y - 1);
            const len = Math.hypot(gx, gy) || 1;

            const shift = bend * edge * edge;

            return texture(
                (x - (gx / len) * shift) / w + 0.5,
                (y - (gy / len) * shift) / h + 0.5
            );
        }

        const glass = window.attachLiquidGlass(el, {
            fragment: pillFragment,
            maxMapSize: 400,
            blur: 2,
            contrast: 1.1,
            brightness: 1.08,
            saturate: 1.3,
            fallbackBlur: 14,
        });

        return () => glass.destroy();
    }, []);

    // Close dropdowns on page navigation
    useEffect(() => {
        setShowProfile(false);
        setShowNotifications(false);
    }, [location.pathname]);

    // Load the user's custom avatar from local storage
    useEffect(() => {
        if (user?.username) {
            const savedAvatar = localStorage.getItem(`avatar_${user.username}`);
            if (savedAvatar) {
                setCustomAvatar(savedAvatar);
            }
        }
    }, [user]);

    // Click-outside listener
    useEffect(() => {
        function handleClickOutside(event) {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfile(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    function handleLogout() {
        logout();
        navigate("/login");
    }

    function handleRefresh() {
        window.location.reload();
    }

    function handleHelp() {
        alert("TOMS Help Center is currently under construction. Please contact your administrator for support.");
    }

    function handleFileSelect(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const base64String = reader.result;
            setCustomAvatar(base64String);
            if (user?.username) {
                localStorage.setItem(`avatar_${user.username}`, base64String);
            }
            setShowProfile(false);
        };
        reader.readAsDataURL(file);
    }

    const defaultAvatar = `https://i.pravatar.cc/150?u=${user?.username || "admin"}`;
    const avatarSrc = customAvatar || defaultAvatar;

    return (
        <div className="topbar-wrap">
            <div className="topbar" ref={topbarRef}>
                <div className="topbar-left">
                    <span className="topbar-title">{title}</span>
                </div>

                <div className="topbar-right">

                    {/* Notifications Dropdown */}
                    <div className="topbar-dropdown-container" ref={notifRef}>
                        <FiBell
                            className="topbar-icon"
                            onClick={() => {
                                setShowNotifications((prev) => !prev);
                                setShowProfile(false);
                            }}
                        />
                        {showNotifications && (
                            <div className="topbar-dropdown notifications-dropdown">
                                <h4>Notifications</h4>
                                <div className="dropdown-divider"></div>
                                <p className="dropdown-empty">No new alerts at this time.</p>
                            </div>
                        )}
                    </div>

                    <FiRotateCcw className="topbar-icon" onClick={handleRefresh} title="Refresh Data" />

                    <FiHelpCircle className="topbar-icon" onClick={handleHelp} title="Help Center" />

                    {/* Profile Dropdown */}
                    <div className="topbar-dropdown-container" ref={profileRef}>
                        <img
                            src={avatarSrc}
                            alt="profile"
                            className="topbar-avatar"
                            style={{ objectFit: "cover", backgroundColor: "#fff" }}
                            onClick={() => {
                                setShowProfile((prev) => !prev);
                                setShowNotifications(false);
                            }}
                        />
                        {showProfile && (
                            <div className="topbar-dropdown profile-dropdown">
                                <div className="dropdown-user-info">
                                    <span className="dropdown-name">{user?.full_name || user?.username || "Admin"}</span>
                                    <span className="dropdown-role">{user?.role || "Administrator"}</span>
                                </div>
                                <div className="dropdown-divider"></div>

                                <button className="dropdown-item" onClick={() => fileInputRef.current?.click()}>
                                    <FiCamera /> Change Picture
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    hidden
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleFileSelect}
                                />

                                <button className="dropdown-item" onClick={() => navigate("/settings")}>
                                    <FiUser /> Account Settings
                                </button>
                                <button className="dropdown-item text-red" onClick={handleLogout}>
                                    <FiLogOut /> Log Out
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Topbar;