// 1. Add useRef to your imports at the top
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // 2. Add a ref to track initialization
    const googleInit = useRef(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    // 3. Update the useEffect
    useEffect(() => {
        // 1. Debug check to prove Docker injected the ID!
        console.log("Loaded Client ID:", GOOGLE_CLIENT_ID);

        if (!GOOGLE_CLIENT_ID) {
            console.error("Vite did not inject the Google Client ID!");
            return;
        }

        // 2. The function that draws the button
        const initializeGoogle = () => {
            if (!window.google) return;
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleGoogleResponse,
            });
            window.google.accounts.id.renderButton(
                document.getElementById("google-signin-button"),
                { theme: "outline", size: "large", width: 320 }
            );
        };

        // 3. Dynamically inject the script to prevent race conditions
        let script = document.getElementById("google-gsi-script");
        if (!script) {
            script = document.createElement("script");
            script.id = "google-gsi-script";
            script.src = "https://accounts.google.com/gsi/client";
            script.async = true;
            script.defer = true;
            script.onload = initializeGoogle; // Wait until it loads to draw!
            document.body.appendChild(script);
        } else {
            initializeGoogle();
        }
    }, []);

    // ... [The rest of your component stays exactly the same] ...
    // Handle the response after a user clicks the Google button
    async function handleGoogleResponse(response) {
        setError(null);
        setSubmitting(true);
        try {
            const data = await api.loginWithGoogle(response.credential);
            login(data.access_token, data.user);
            navigate("/");
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    // Handle standard Username/Password login
    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            const data = await api.login(username, password);
            login(data.access_token, data.user);
            navigate("/");
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="login-page">
            <form className="login-card" onSubmit={handleSubmit}>
                <h1>TOMS</h1>
                <p className="login-subtitle">Enterprise Resource Control</p>

                {error && <p className="login-error">{error}</p>}

                <label>Username</label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoFocus
                    required
                />

                <label>Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button type="submit" disabled={submitting}>
                    {submitting ? "Signing in..." : "Sign In"}
                </button>

                {/* Added Google Sign-In UI Elements */}
                <div style={{ margin: "18px 0", textAlign: "center", fontSize: "12px", color: "var(--text-muted)" }}>
                    or
                </div>
                <div id="google-signin-button" style={{ display: "flex", justifyContent: "center" }}></div>

            </form>
        </div>
    );
}

export default Login;