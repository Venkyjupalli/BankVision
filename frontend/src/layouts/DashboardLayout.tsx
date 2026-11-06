
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function DashboardLayout() {
  return (
    <div className="app-container">
      <Sidebar />

      <main className="main-content">
        <Header />
        <Outlet />
      </main>
    </div>
  );
}
