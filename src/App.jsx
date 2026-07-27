import { Routes, Route } from "react-router-dom";

import AppLayout from "./layouts/AppLayout/AppLayout";
import Dashboard from "./pages/Dashboard/Dashboard";
import IncidentEntry from "./pages/IncidentEntry/IncidentEntry";
import Breakdowns from "./pages/Breakdowns/Breakdowns";
import Reports from "./pages/Reports/Reports";
import Clients from "./pages/Clients/Clients";
import Settings from "./pages/Settings/Settings";

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/stop-management" element={<IncidentEntry />} />
        <Route path="/breakdowns" element={<Breakdowns />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;