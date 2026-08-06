import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Topbar.css";
import { FiBell, FiRotateCcw, FiHelpCircle, FiLogOut, FiUser, FiCamera } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

function Topbar({ title = "Operations Dashboard" }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [showProfile, setShowProfile] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [customAvatar, setCustomAvatar] = useState(null);

    const profileRef = useRef(null);
    const notifRef = useRef(null);
    const fileInputRef = useRef(null);

    // 1. Load the user's custom avatar from local storage when they log in
    useEffect(() => {
        if (user?.username) {
            const savedAvatar = localStorage.getItem(`avatar_${user.username}`);
            if (savedAvatar) {
                setCustomAvatar(savedAvatar);
            }
        }
    }, [user]);

    // Close dropdowns automatically when clicking anywhere else on the screen
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

    // 2. Handle the user selecting a new profile picture from their computer
    function handleFileSelect(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const base64String = reader.result;
            setCustomAvatar(base64String); // Update the UI immediately

            // Save it securely to local storage tied to this specific user
            if (user?.username) {
                localStorage.setItem(`avatar_${user.username}`, base64String);
            }

            setShowProfile(false); // Close the menu
        };
        reader.readAsDataURL(file); // Convert image to a string we can save
    }

    // 3. Fallback to a CONSISTENT default avatar based on username
    const defaultAvatar = `https://i.pravatar.cc/150?u=${user?.username || "admin"}`;
    const avatarSrc = customAvatar || defaultAvatar;

    return (
        <div className="topbar">
            <div className="topbar-left">
                <span className="topbar-title">{title}</span>
            </div>

            <div className="topbar-right">

                {/* Notifications Dropdown */}
                <div className="topbar-dropdown-container" ref={notifRef}>
                    <FiBell
                        className="topbar-icon"
                        onClick={() => {
                            setShowNotifications(!showNotifications);
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
                            setShowProfile(!showProfile);
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

                            {/* Hidden file input for uploading a new picture */}
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
    );
}

export default Topbar;