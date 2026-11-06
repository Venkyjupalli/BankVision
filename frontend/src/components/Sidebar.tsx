
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  Wallet,
  Landmark,
  GitBranch,
  ShieldCheck,
  Settings,
  ChartNoAxesCombined,
} from "lucide-react";

const menuItems = [
  { name: "Overview", path: "/", icon: LayoutDashboard },
  { name: "Customers", path: "/customers", icon: Users },
  { name: "Transactions", path: "/transactions", icon: ArrowLeftRight },
  { name: "Loans", path: "/loans", icon: Wallet },
  { name: "Deposits", path: "/deposits", icon: Landmark },
  { name: "Branches", path: "/branches", icon: GitBranch },
  { name: "Risk Intelligence", path: "/risk", icon: ShieldCheck },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">
          <ChartNoAxesCombined size={25} />
        </div>

        <div>
          <h2>BankVision</h2>
          <span>Banking Intelligence</span>
        </div>
      </div>

      <div className="menu-section">
        <p className="menu-heading">MAIN MENU</p>

        <nav>
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                to={item.path}
                key={item.name}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `menu-item ${isActive ? "active" : ""}`
                }
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-bottom">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `menu-item ${isActive ? "active" : ""}`
          }
        >
          <Settings size={19} />
          <span>Settings</span>
        </NavLink>

        <div className="sidebar-footer">
          <div className="footer-avatar">BV</div>

          <div>
            <strong>BankVision</strong>
            <span>Analytics Platform</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
