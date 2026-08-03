import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import AppLayout from "./layouts/AppLayout/AppLayout";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import IncidentEntry from "./pages/IncidentEntry/IncidentEntry";
import Breakdowns from "./pages/Breakdowns/Breakdowns";
import Reports from "./pages/Reports/Reports";
import Clients from "./pages/Clients/Clients";
import Settings from "./pages/Settings/Settings";
import EditIncident from "./pages/EditIncident/EditIncident";
import EditBreakdown from "./pages/EditBreakdown/EditBreakdown";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/stop-management" element={<IncidentEntry />} />
        <Route path="/breakdowns" element={<Breakdowns />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/stop-management/edit/:id" element={<EditIncident />} />
        <Route path="/breakdowns/edit/:id" element={<EditBreakdown />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;