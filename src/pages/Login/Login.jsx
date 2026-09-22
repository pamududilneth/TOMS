import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../../lib/msalConfig";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const { instance, accounts, inProgress } = useMsal();

    // Handles the return trip after Microsoft redirects back to this page
    useEffect(() => {
        if (inProgress !== "none") return;
        if (accounts.length === 0) return;

        async function completeLogin() {
            setSubmitting(true);
            try {
                const account = accounts[0];
                const result = await instance.acquireTokenSilent({
                    ...loginRequest,
                    account,
                });
                const data = await api.loginWithMicrosoft(result.idToken);
                login(data.access_token, data.user);
                navigate("/");
            } catch (err) {
                setError(err.message || "Microsoft sign-in failed to complete.");
            } finally {
                setSubmitting(false);
            }
        }

        completeLogin();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accounts, inProgress]);

    function handleMicrosoftLogin() {
        setError(null);
        instance.loginRedirect(loginRequest);
        // Page navigates away here — the useEffect above handles the return trip
    }

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

                <div style={{ margin: "18px 0", textAlign: "center", fontSize: "12px", color: "var(--text-muted)" }}>
                    or
                </div>

                <button
                    type="button"
                    onClick={handleMicrosoftLogin}
                    disabled={submitting}
                    style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "1px solid var(--border-strong)",
                        background: "#fff",
                        color: "var(--text-primary)",
                        fontSize: "14px",
                        fontWeight: 500,
                        cursor: "pointer",
                    }}>
                    {submitting ? "Signing in..." : "Sign in with Microsoft"}
                </button>

            </form>
        </div>
    );
}

export default Login;