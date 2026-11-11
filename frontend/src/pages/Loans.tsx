
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Landmark,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  TrendingDown,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import { API_URL } from "../services/config";
const PAGE_SIZE = 10;
const ANALYTICS_BATCH_SIZE = 100;

interface Loan {
  loan_id: number;
  loan_reference: string;
  customer_id: number;
  account_id: number | null;
  loan_type: string;
  loan_amount: number | string;
  interest_rate: number | string;
  loan_tenure_months: number;
  monthly_emi: number | string | null;
  outstanding_amount: number | string | null;
  loan_status: string;
  disbursement_date: string | null;
  maturity_date: string | null;
}

interface Pagination {
  currentPage: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
}

interface LoanResponse {
  loans: Loan[];
  pagination: Pagination;
}

interface AnalyticsItem {
  name: string;
  value: number;
}

const STATUS_COLORS: Record<string, string> = {
  Active: "#315bd6",
  Closed: "#10b981",
  Defaulted: "#ef4444",
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-IN").format(value || 0);

const formatCurrency = (value: number) =>
  Number(value || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

const formatDate = (date: string | null) =>
  date
    ? new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      })
    : "â€”";

export default function Loans() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [allLoans, setAllLoans] = useState<Loan[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");

  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAllLoanAnalytics = async () => {
    setAnalyticsLoading(true);

    try {
      const firstResponse = await axios.get<LoanResponse>(
        `${API_URL}/loans/list`,
        {
          params: { page: 1, limit: ANALYTICS_BATCH_SIZE },
        }
      );

      const firstBatch = firstResponse.data.loans || [];
      const totalPages = firstResponse.data.pagination.totalPages || 1;

      const remainingRequests = Array.from(
        { length: Math.max(0, totalPages - 1) },
        (_, index) =>
          axios.get<LoanResponse>(`${API_URL}/loans/list`, {
            params: {
              page: index + 2,
              limit: ANALYTICS_BATCH_SIZE,
            },
          })
      );

      const remainingResponses = await Promise.all(remainingRequests);

      const completeDataset = [
        ...firstBatch,
        ...remainingResponses.flatMap(
          (response) => response.data.loans || []
        ),
      ];

      setAllLoans(completeDataset);
    } catch (err) {
      console.error("Loan analytics error:", err);
      setError("Unable to load complete loan analytics.");
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchLoanRecords = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get<LoanResponse>(
        `${API_URL}/loans/list`,
        {
          params: {
            page,
            limit: PAGE_SIZE,
            search: search.trim(),
            status,
            type,
          },
        }
      );

      setLoans(response.data.loans || []);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error("Loan records error:", err);
      setError("Unable to load loan records. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchAllLoanAnalytics();
    fetchLoanRecords();
  };

  useEffect(() => {
    fetchAllLoanAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchLoanRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, status, type]);

  const totalLoans = allLoans.length;

  const activeLoans = allLoans.filter(
    (loan) => loan.loan_status.toLowerCase() === "active"
  );

  const closedLoans = allLoans.filter(
    (loan) => loan.loan_status.toLowerCase() === "closed"
  );

  const defaultedLoans = allLoans.filter(
    (loan) => loan.loan_status.toLowerCase() === "defaulted"
  );

  const totalPortfolio = allLoans.reduce(
    (sum, loan) => sum + Number(loan.loan_amount || 0),
    0
  );

  const totalOutstanding = allLoans.reduce(
    (sum, loan) => sum + Number(loan.outstanding_amount || 0),
    0
  );

  const statusData: AnalyticsItem[] = [
    { name: "Active", value: activeLoans.length },
    { name: "Closed", value: closedLoans.length },
    { name: "Defaulted", value: defaultedLoans.length },
  ];

  const loanTypeData = Object.entries(
    allLoans.reduce<Record<string, number>>((result, loan) => {
      result[loan.loan_type] = (result[loan.loan_type] || 0) + 1;
      return result;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const loanTypeColors = [
    "#315bd6",
    "#8b5cf6",
    "#10b981",
    "#f59e0b",
    "#06b6d4",
  ];

  const getPercentage = (value: number) =>
    totalLoans > 0 ? ((value / totalLoans) * 100).toFixed(1) : "0.0";

  const getStatusClass = (value: string) => {
    const normalized = value.toLowerCase();

    if (normalized === "active") return "loan-status-badge active";
    if (normalized === "closed") return "loan-status-badge closed";
    if (normalized === "defaulted") return "loan-status-badge defaulted";

    return "loan-status-badge";
  };

  const handleFilterChange = (
    setter: (value: string) => void,
    value: string
  ) => {
    setter(value);
    setPage(1);
  };

  return (
    <div className="loan-dashboard">
      <div className="loan-page-header">
        <div>
          <h1>Loan Intelligence</h1>
          <p>
            Monitor loan portfolios, outstanding balances and repayment
            status.
          </p>
        </div>

        <button
          className="loan-refresh-btn"
          onClick={refreshData}
          disabled={loading || analyticsLoading}
        >
          <RefreshCw size={16} />
          Refresh Data
        </button>
      </div>

      {error && <div className="loan-error">{error}</div>}

      {/* KPI CARDS */}
      <div className="loan-stats-grid">
        <div className="loan-stat-card">
          <div className="loan-stat-icon total">
            <Landmark size={23} />
          </div>
          <div>
            <p>Total Loans</p>
            <h2>
              {analyticsLoading ? "â€”" : formatNumber(totalLoans)}
            </h2>
            <span>Loans in the portfolio</span>
          </div>
        </div>

        <div className="loan-stat-card">
          <div className="loan-stat-icon portfolio">
            <Wallet size={23} />
          </div>
          <div>
            <p>Total Loan Portfolio</p>
            <h2>
              {analyticsLoading ? "â€”" : formatCurrency(totalPortfolio)}
            </h2>
            <span>Total original loan amount</span>
          </div>
        </div>

        <div className="loan-stat-card">
          <div className="loan-stat-icon active">
            <CheckCircle2 size={23} />
          </div>
          <div>
            <p>Active Loans</p>
            <h2>
              {analyticsLoading ? "â€”" : formatNumber(activeLoans.length)}
            </h2>
            <span>Currently active loans</span>
          </div>
        </div>

        <div className="loan-stat-card">
          <div className="loan-stat-icon defaulted">
            <AlertTriangle size={23} />
          </div>
          <div>
            <p>Defaulted Loans</p>
            <h2>
              {analyticsLoading ? "â€”" : formatNumber(defaultedLoans.length)}
            </h2>
            <span>Loans marked as defaulted</span>
          </div>
        </div>
      </div>

      {/* OUTSTANDING BALANCE */}
      <section className="loan-outstanding-card">
        <div className="loan-outstanding-icon">
          <TrendingDown size={23} />
        </div>

        <div className="loan-outstanding-info">
          <p>Total Outstanding Amount</p>
          <h2>
            {analyticsLoading ? "â€”" : formatCurrency(totalOutstanding)}
          </h2>
          <span>Outstanding balances across all loan records</span>
        </div>

        <div className="loan-outstanding-side">
          <span>Closed Loans</span>
          <strong>
            {analyticsLoading ? "â€”" : formatNumber(closedLoans.length)}
          </strong>
        </div>
      </section>

      {/* ANALYTICS */}
      <div className="loan-analytics-grid">
        <section className="loan-chart-card">
          <div className="loan-section-heading">
            <div>
              <h2>Loan Status Distribution</h2>
              <p>Portfolio breakdown by loan status</p>
            </div>
          </div>

          <div className="loan-pie-chart">
            {analyticsLoading ? (
              <div className="loan-chart-message">
                Loading loan analytics...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="47%"
                    innerRadius={65}
                    outerRadius={105}
                    paddingAngle={3}
                  >
                    {statusData.map((item) => (
                      <Cell
                        key={item.name}
                        fill={STATUS_COLORS[item.name]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatNumber(Number(value))}
                  />
                  <Legend verticalAlign="bottom" height={35} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="loan-chart-card">
          <div className="loan-section-heading">
            <div>
              <h2>Loan Type Analysis</h2>
              <p>Number of loans across different loan types</p>
            </div>
          </div>

          <div className="loan-bar-chart">
            {analyticsLoading ? (
              <div className="loan-chart-message">
                Loading loan analytics...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={loanTypeData}
                  margin={{ top: 15, right: 15, left: 0, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#edf0f5"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    angle={-12}
                    textAnchor="end"
                    height={55}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    formatter={(value) => formatNumber(Number(value))}
                  />
                  <Bar
                    dataKey="value"
                    name="Number of Loans"
                    radius={[7, 7, 0, 0]}
                    barSize={45}
                  >
                    {loanTypeData.map((item, index) => (
                      <Cell
                        key={item.name}
                        fill={loanTypeColors[index % loanTypeColors.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      </div>

      {/* STATUS BREAKDOWN */}
      <section className="loan-breakdown-card">
        <div className="loan-section-heading">
          <div>
            <h2>Loan Portfolio Breakdown</h2>
            <p>Loan status and percentage contribution</p>
          </div>
        </div>

        <div className="loan-breakdown-list">
          {statusData.map((item) => {
            const percentage = Number(getPercentage(item.value));

            return (
              <div className="loan-breakdown-row" key={item.name}>
                <div className="loan-breakdown-label">
                  <span
                    className="loan-breakdown-dot"
                    style={{ background: STATUS_COLORS[item.name] }}
                  />
                  <strong>{item.name}</strong>
                </div>

                <div className="loan-breakdown-progress">
                  <div className="loan-breakdown-track">
                    <div
                      className="loan-breakdown-fill"
                      style={{
                        width: `${percentage}%`,
                        background: STATUS_COLORS[item.name],
                      }}
                    />
                  </div>
                </div>

                <strong className="loan-breakdown-value">
                  {formatNumber(item.value)}
                </strong>

                <span className="loan-breakdown-percentage">
                  {percentage.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* LOAN RECORDS */}
      <section className="loan-records-card">
        <div className="loan-records-header">
          <div>
            <h2>Loan Records</h2>
            <p>Search and explore individual loan information</p>
          </div>

          <span className="loan-record-count">
            {formatNumber(pagination?.totalRecords || 0)} records
          </span>
        </div>

        <div className="loan-filter-toolbar">
          <div className="loan-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search loan reference or customer ID..."
              value={search}
              onChange={(e) =>
                handleFilterChange(setSearch, e.target.value)
              }
            />
          </div>

          <select
            value={status}
            onChange={(e) =>
              handleFilterChange(setStatus, e.target.value)
            }
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Closed">Closed</option>
            <option value="Defaulted">Defaulted</option>
          </select>

          <select
            value={type}
            onChange={(e) =>
              handleFilterChange(setType, e.target.value)
            }
          >
            <option value="">All Loan Types</option>
            <option value="Home Loan">Home Loan</option>
            <option value="Personal Loan">Personal Loan</option>
            <option value="Vehicle Loan">Vehicle Loan</option>
            <option value="Education Loan">Education Loan</option>
          </select>
        </div>

        <div className="loan-table-wrapper">
          <table className="loan-data-table">
            <thead>
              <tr>
                <th>Loan ID</th>
                <th>Loan Reference</th>
                <th>Customer ID</th>
                <th>Loan Type</th>
                <th>Loan Amount</th>
                <th>Outstanding</th>
                <th>Interest Rate</th>
                <th>Monthly EMI</th>
                <th>Tenure</th>
                <th>Disbursement</th>
                <th>Maturity</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={12} className="loan-table-message">
                    Loading loan records...
                  </td>
                </tr>
              ) : loans.length === 0 ? (
                <tr>
                  <td colSpan={12} className="loan-table-message">
                    No loans found.
                  </td>
                </tr>
              ) : (
                loans.map((loan) => (
                  <tr key={loan.loan_id}>
                    <td className="loan-id">#{loan.loan_id}</td>
                    <td className="loan-reference">
                      {loan.loan_reference}
                    </td>
                    <td>{loan.customer_id}</td>
                    <td>{loan.loan_type}</td>
                    <td>{formatCurrency(Number(loan.loan_amount))}</td>
                    <td>
                      {loan.outstanding_amount === null
                        ? "â€”"
                        : formatCurrency(Number(loan.outstanding_amount))}
                    </td>
                    <td>{Number(loan.interest_rate).toFixed(2)}%</td>
                    <td>
                      {loan.monthly_emi === null
                        ? "â€”"
                        : formatCurrency(Number(loan.monthly_emi))}
                    </td>
                    <td>{loan.loan_tenure_months} months</td>
                    <td>{formatDate(loan.disbursement_date)}</td>
                    <td>{formatDate(loan.maturity_date)}</td>
                    <td>
                      <span className={getStatusClass(loan.loan_status)}>
                        {loan.loan_status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="loan-pagination">
          <span>
            Showing {loading ? 0 : loans.length} of{" "}
            {formatNumber(pagination?.totalRecords || 0)} loans
          </span>

          <div className="loan-pagination-controls">
            <button
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1 || loading}
            >
              <ChevronLeft size={17} />
              Previous
            </button>

            <span>
              Page {pagination?.currentPage || page} of{" "}
              {pagination?.totalPages || 1}
            </span>

            <button
              onClick={() =>
                setPage((current) =>
                  Math.min(pagination?.totalPages || 1, current + 1)
                )
              }
              disabled={
                page >= (pagination?.totalPages || 1) || loading
              }
            >
              Next
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </section>

      <p className="loan-disclaimer">
        Loan analytics are based on BankVision's synthetic demonstration
        dataset. Outstanding balances and loan classifications are illustrative.
      </p>
    </div>
  );
}
