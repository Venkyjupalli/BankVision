
import { useEffect, useState } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

import { API_URL } from "../services/config";

interface RiskSummary {
  totalLoans: number;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
  closedLoans: number;
}

interface RiskRecord {
  loan_id: number;
  loan_reference: string;
  customer_id: number;
  customer_name: string;
  annual_income: number;
  loan_type: string;
  loan_amount: number;
  monthly_emi: number;
  outstanding_amount: number;
  loan_status: string;
  monthly_income: number;
  emi_to_income_percentage: number;
  risk_category: string;
}

const emptySummary: RiskSummary = {
  totalLoans: 0,
  highRisk: 0,
  mediumRisk: 0,
  lowRisk: 0,
  closedLoans: 0,
};

const formatCurrency = (value: number | string) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-IN").format(value || 0);

function Risk() {
  const [summary, setSummary] = useState<RiskSummary>(emptySummary);
  const [records, setRecords] = useState<RiskRecord[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

  const fetchSummary = async () => {
    const response = await axios.get(`${API_URL}/risk/summary`);
    setSummary({
      totalLoans: Number(response.data.totalLoans) || 0,
      highRisk: Number(response.data.highRisk) || 0,
      mediumRisk: Number(response.data.mediumRisk) || 0,
      lowRisk: Number(response.data.lowRisk) || 0,
      closedLoans: Number(response.data.closedLoans) || 0,
    });
  };

  const fetchRecords = async () => {
    const response = await axios.get(`${API_URL}/risk/list`, {
      params: {
        page,
        limit: pageSize,
        search: search.trim() || undefined,
        category: category || undefined,
      },
    });

    const payload = response.data;

    // Supports common response formats from the backend.
    const rows = Array.isArray(payload)
      ? payload
      : payload.data ?? payload.rows ?? payload.records ?? [];

    setRecords(rows);

    const total =
      payload.totalRecords ??
      payload.total ??
      payload.pagination?.totalRecords ??
      payload.pagination?.total ??
      rows.length;

    setTotalRecords(Number(total) || 0);
  };

  const loadRiskData = async () => {
    try {
      setLoading(true);
      setError("");
      await Promise.all([fetchSummary(), fetchRecords()]);
    } catch (err) {
      console.error("Risk dashboard error:", err);
      setError("Unable to load risk data. Check that the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRiskData();
    // loadRiskData is intentionally called when filters or page change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, category]);

  const chartData = [
    { name: "High Risk", value: summary.highRisk, color: "#ef4444" },
    { name: "Medium Risk", value: summary.mediumRisk, color: "#f59e0b" },
    { name: "Low Risk", value: summary.lowRisk, color: "#10b981" },
  ];

  const getRiskClass = (value: string) => {
    const risk = value?.toLowerCase();
    if (risk === "high") return "risk-badge risk-high";
    if (risk === "medium") return "risk-badge risk-medium";
    if (risk === "low") return "risk-badge risk-low";
    return "risk-badge risk-closed";
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleCategory = (value: string) => {
    setCategory(value);
    setPage(1);
  };

  return (
    <div className="risk-page">
      <div className="risk-page-header">
        <div>
          <h1>Risk Management</h1>
          <p>Customer and loan risk intelligence.</p>
        </div>

        <button className="risk-refresh-btn" onClick={loadRiskData}>
          <RefreshCw size={16} />
          Refresh Data
        </button>
      </div>

      {error && <div className="risk-error">{error}</div>}

      <div className="risk-stats-grid">
        <div className="risk-stat-card">
          <div className="risk-stat-icon total">
            <Shield size={22} />
          </div>
          <div>
            <p>Total Loans Assessed</p>
            <h2>{loading ? "â€”" : formatNumber(summary.totalLoans)}</h2>
          </div>
        </div>

        <div className="risk-stat-card">
          <div className="risk-stat-icon high">
            <ShieldAlert size={22} />
          </div>
          <div>
            <p>High Risk Loans</p>
            <h2>{loading ? "â€”" : formatNumber(summary.highRisk)}</h2>
          </div>
        </div>

        <div className="risk-stat-card">
          <div className="risk-stat-icon medium">
            <ShieldAlert size={22} />
          </div>
          <div>
            <p>Medium Risk Loans</p>
            <h2>{loading ? "â€”" : formatNumber(summary.mediumRisk)}</h2>
          </div>
        </div>

        <div className="risk-stat-card">
          <div className="risk-stat-icon low">
            <ShieldCheck size={22} />
          </div>
          <div>
            <p>Low Risk Loans</p>
            <h2>{loading ? "â€”" : formatNumber(summary.lowRisk)}</h2>
          </div>
        </div>
      </div>

      <div className="risk-content-grid">
        <section className="risk-chart-card">
          <div className="risk-section-heading">
            <div>
              <h2>Risk Distribution</h2>
              <p>Distribution of active loan risk categories</p>
            </div>
          </div>

          <div className="risk-chart-container">
            {loading ? (
              <div className="risk-empty-state">Loading chart...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="48%"
                    innerRadius={65}
                    outerRadius={105}
                    paddingAngle={3}
                  >
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatNumber(Number(value))} />
                  <Legend verticalAlign="bottom" height={35} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="risk-insight-card">
          <div className="risk-section-heading">
            <div>
              <h2>Risk Overview</h2>
              <p>Current loan portfolio classification</p>
            </div>
          </div>

          <div className="risk-overview-item">
            <div>
              <span className="risk-dot red" />
              <span>High Risk</span>
            </div>
            <strong>{formatNumber(summary.highRisk)}</strong>
          </div>

          <div className="risk-overview-item">
            <div>
              <span className="risk-dot orange" />
              <span>Medium Risk</span>
            </div>
            <strong>{formatNumber(summary.mediumRisk)}</strong>
          </div>

          <div className="risk-overview-item">
            <div>
              <span className="risk-dot green" />
              <span>Low Risk</span>
            </div>
            <strong>{formatNumber(summary.lowRisk)}</strong>
          </div>

          <div className="risk-overview-item">
            <div>
              <span className="risk-dot gray" />
              <span>Closed Loans</span>
            </div>
            <strong>{formatNumber(summary.closedLoans)}</strong>
          </div>

          <div className="risk-note">
            <ShieldCheck size={18} />
            <span>
              Risk categories are illustrative classifications based on the
              synthetic project dataset.
            </span>
          </div>
        </section>
      </div>

      <section className="risk-records-card">
        <div className="risk-records-header">
          <div>
            <h2>Loan Risk Records</h2>
            <p>Review individual loan risk classifications</p>
          </div>
          <span className="risk-record-count">
            {formatNumber(totalRecords)} records
          </span>
        </div>

        <div className="risk-toolbar">
          <div className="risk-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search customer, loan reference or ID..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          <select
            value={category}
            onChange={(e) => handleCategory(e.target.value)}
            className="risk-filter-select"
          >
            <option value="">All Risk Categories</option>
            <option value="High">High Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="Low">Low Risk</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <div className="risk-table-wrapper">
          <table className="risk-table">
            <thead>
              <tr>
                <th>Loan Reference</th>
                <th>Customer</th>
                <th>Loan Type</th>
                <th>Loan Amount</th>
                <th>Outstanding</th>
                <th>EMI / Income</th>
                <th>Loan Status</th>
                <th>Risk Category</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="risk-table-message">
                    Loading risk records...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={8} className="risk-table-message">
                    No risk records found.
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.loan_id}>
                    <td className="risk-reference">
                      {record.loan_reference}
                    </td>
                    <td>
                      <div className="risk-customer-cell">
                        <strong>{record.customer_name}</strong>
                        <small>Customer ID: {record.customer_id}</small>
                      </div>
                    </td>
                    <td>{record.loan_type}</td>
                    <td>{formatCurrency(record.loan_amount)}</td>
                    <td>{formatCurrency(record.outstanding_amount)}</td>
                    <td>
                      {Number(record.emi_to_income_percentage || 0).toFixed(2)}%
                    </td>
                    <td>
                      <span className="risk-status-text">
                        {record.loan_status}
                      </span>
                    </td>
                    <td>
                      <span className={getRiskClass(record.risk_category)}>
                        {record.risk_category}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="risk-pagination">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="risk-pagination-controls">
            <button
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1 || loading}
              aria-label="Previous page"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              disabled={page >= totalPages || loading}
              aria-label="Next page"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      <p className="risk-disclaimer">
        BankVision uses synthetic data for demonstration. Risk classifications
        are illustrative and are not real banking credit decisions.
      </p>
    </div>
  );
}

export default Risk;
