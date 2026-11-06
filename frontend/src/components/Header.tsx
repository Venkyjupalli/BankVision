
import { Search, Bell, ChevronDown } from "lucide-react";

export default function Header() {
  return (
    <header className="top-header">
      <div>
        <p className="header-label">BANKING ANALYTICS PLATFORM</p>
        <h1>Dashboard Overview</h1>
      </div>

      <div className="header-actions">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search anything..."
          />
        </div>

        <button className="notification-button">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>

        <div className="profile">
          <div className="profile-avatar">JV</div>
          <div className="profile-info">
            <strong>Administrator</strong>
            <span>BankVision User</span>
          </div>
          <ChevronDown size={16} />
        </div>
      </div>
    </header>
  );
}
