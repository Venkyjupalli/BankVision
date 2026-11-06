import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import Overview from "./pages/Overview";
import Customers from "./pages/Customers";
import Transactions from "./pages/Transactions";
import Loans from "./pages/Loans";
import Deposits from "./pages/Deposits";
import Branches from "./pages/Branches";
import Risk from "./pages/Risk";
import Settings from "./pages/Settings";
import {
  SettingsProvider,
  useAppSettings,
} from "./context/SettingsContext";

function DefaultLandingPage() {
  const { preferences } = useAppSettings();

  const defaultPage = preferences.defaultPage || "/";

  if (defaultPage === "/") {
    return <Overview />;
  }

  return <Navigate to={defaultPage} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<DefaultLandingPage />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/loans" element={<Loans />} />
        <Route path="/deposits" element={<Deposits />} />
        <Route path="/branches" element={<Branches />} />
        <Route path="/risk" element={<Risk />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <AppRoutes />
      </SettingsProvider>
    </BrowserRouter>
  );
}

export default App;