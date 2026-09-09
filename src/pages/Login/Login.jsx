// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "./Login.css";
// import { useAuth } from "../../context/AuthContext";
// import { api } from "../../lib/api";
// import { useMsal } from "@azure/msal-react";
// import { loginRequest } from "../../lib/msalConfig";

// function Login() {
//     const [username, setUsername] = useState("");
//     const [password, setPassword] = useState("");
//     const [error, setError] = useState(null);
//     const [submitting, setSubmitting] = useState(false);

//     const { login } = useAuth();
//     const navigate = useNavigate();

//     // Microsoft MSAL instance
//     const { instance } = useMsal();

//     // Handle Microsoft Entra ID Login
//     async function handleMicrosoftLogin() {
//         console.log("CLIENT_ID:", import.meta.env.VITE_ENTRA_CLIENT_ID);
//         console.log("TENANT_ID:", import.meta.env.VITE_ENTRA_TENANT_ID);
//         if (submitting) return; // prevent stacking multiple popups on repeated clicks

//         setError(null);
//         setSubmitting(true);
//         try {

//             const result = await instance.loginPopup(loginRequest);
//             const data = await api.loginWithMicrosoft(result.idToken);
//             login(data.access_token, data.user);
//             navigate("/");
//         } catch (err) {
//             if (err.errorCode === "interaction_in_progress") {
//                 setError("A sign-in window is already open — check for it or close stuck windows and try again.");
//             } else {
//                 setError(err.message);
//             }
//         } finally {
//             setSubmitting(false);
//         }
//     }

//     // Handle standard Username/Password login
//     async function handleSubmit(e) {
//         e.preventDefault();
//         setError(null);
//         setSubmitting(true);
//         try {
//             const data = await api.login(username, password);
//             login(data.access_token, data.user);
//             navigate("/");
//         } catch (err) {
//             setError(err.message);
//         } finally {
//             setSubmitting(false);
//         }
//     }

//     return (
//         <div className="login-page">
//             <form className="login-card" onSubmit={handleSubmit}>
//                 <h1>TOMS</h1>
//                 <p className="login-subtitle">Enterprise Resource Control</p>

//                 {error && <p className="login-error">{error}</p>}

//                 <label>Username</label>
//                 <input
//                     type="text"
//                     value={username}
//                     onChange={(e) => setUsername(e.target.value)}
//                     autoFocus
//                     required
//                 />

//                 <label>Password</label>
//                 <input
//                     type="password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     required
//                 />

//                 <button type="submit" disabled={submitting}>
//                     {submitting ? "Signing in..." : "Sign In"}
//                 </button>

//                 <div style={{ margin: "18px 0", textAlign: "center", fontSize: "12px", color: "var(--text-muted)" }}>
//                     or
//                 </div>

//                 <button
//                     type="button"
//                     onClick={handleMicrosoftLogin}
//                     disabled={submitting}
//                     style={{
//                         width: "100%",
//                         padding: "12px",
//                         borderRadius: "8px",
//                         border: "1px solid var(--border-strong)",
//                         background: "#fff",
//                         color: "var(--text-primary)",
//                         fontSize: "14px",
//                         fontWeight: 500,
//                         cursor: "pointer",
//                     }}>
//                     Sign in with Microsoft
//                 </button>

//             </form>
//         </div>
//     );
// }

// export default Login; 

import { useState } from "react";
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

    // Microsoft MSAL instance
    const { instance } = useMsal();

    // Handle Microsoft Entra ID Login
    // async function handleMicrosoftLogin() {
    //     console.log("CLIENT_ID:", import.meta.env.VITE_ENTRA_CLIENT_ID);
    //     console.log("TENANT_ID:", import.meta.env.VITE_ENTRA_TENANT_ID);
    //     if (submitting) return; // prevent stacking multiple popups on repeated clicks

    //     setError(null);
    //     setSubmitting(true);
    //     try {
    //         console.log("Calling loginPopup with request:", loginRequest);
    //         const result = await instance.loginPopup(loginRequest);
    //         console.log("loginPopup succeeded:", result);

    //         const data = await api.loginWithMicrosoft(result.idToken);
    //         login(data.access_token, data.user);
    //         navigate("/");
    //     } catch (err) {
    //         if (err.errorCode === "interaction_in_progress") {
    //             setError("A sign-in window is already open — check for it or close stuck windows and try again.");
    //         } else {
    //             setError(err.message);
    //         }
    //     } finally {
    //         setSubmitting(false);
    //     }
    // }

    async function handleMicrosoftLogin() {
        if (submitting) return;

        console.log("=== Starting Microsoft login ===");
        setError(null);
        setSubmitting(true);

        try {
            console.log("Calling loginPopup...");
            const result = await instance.loginPopup(loginRequest);
            console.log("loginPopup resolved successfully:", result);

            const data = await api.loginWithMicrosoft(result.idToken);
            login(data.access_token, data.user);
            navigate("/");
        } catch (err) {
            console.error("=== loginPopup THREW an error ===");
            console.error("Full error object:", err);
            console.error("err.errorCode:", err?.errorCode);
            console.error("err.errorMessage:", err?.errorMessage);
            console.error("err.name:", err?.name);
            console.error("err.message:", err?.message);
            setError(err.message || err.errorMessage || "Unknown error — check console");
        } finally {
            setSubmitting(false);
            console.log("=== Login attempt finished ===");
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
                    Sign in with Microsoft
                </button>

            </form>
        </div>
    );
}

export default Login;