
import { useLocation } from "react-router-dom";

const pageDetails: Record<string, string> = {
  "/customers": "Customer intelligence and segmentation analytics.",
  "/transactions": "Transaction monitoring and payment analytics.",
  "/loans": "Loan performance and credit risk analytics.",
  "/deposits": "Deposit accounts and fixed deposit analytics.",
  "/branches": "Branch-wise banking performance.",
  "/risk": "Customer and loan risk intelligence.",
  "/settings": "Application preferences and configuration.",
};

export default function PlaceholderPage() {
  const location = useLocation();
  const description =
    pageDetails[location.pathname] ?? "Banking analytics workspace.";

  const title =
    location.pathname
      .split("/")
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ") || "Overview";

  return (
    <section className="dashboard-content">
      <div className="welcome-section">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <span className="status-indicator">Platform Ready</span>
      </div>

      <div className="placeholder-section">
        <div className="placeholder-icon">
          <span>BV</span>
        </div>
        <h2>{title} Workspace</h2>
        <p>{description}</p>
        <span>Analytics integration coming next</span>
      </div>
    </section>
  );
}
