
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Wallet,
  Landmark,
  CheckCircle,
  CalendarCheck,
  Search,
  RefreshCw,
  TrendingUp,
  AlertCircle,
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

const API_URL = "http://localhost:5000/api/dashboard";

interface Deposit {
  fd_id: number;
  fd_reference: string;
  customer_id: number;
  account_id: number;
  principal_amount: number | string;
  interest_rate: number | string;
  tenure_months: number;
  maturity_amount: number | string | null;
  opening_date: string;
  maturity_date: string;
  fd_status: string;
  payout_type: string | null;
}

interface Pagination {
  currentPage: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
}

interface DepositResponse {
  deposits: Deposit[];
  pagination: Pagination;
}

const PAGE_SIZE = 10;
const COLORS = ["#2563eb", "#f59e0b", "#64748b", "#10b981"];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const formatCompactCurrency = (value: number) => {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
  return formatCurrency(value);
};

const formatDate = (date: string | null | undefined) => {
  if (!date) return "—";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const money = (value: number | string | null | undefined) =>
  Number(value ?? 0) || 0;

const normalize = (value: string | null | undefined) =>
  (value || "Unknown").trim();

function Deposits() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [allDeposits, setAllDeposits] = useState<Deposit[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    limit: PAGE_SIZE,
    totalRecords: 0,
    totalPages: 0,
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [payoutType, setPayoutType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch one page of FD records for the table.
  const fetchTableData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get<DepositResponse>(
        `${API_URL}/deposits/list`,
        {
          params: {
            page: currentPage,
            limit: PAGE_SIZE,
            search: search.trim(),
            status,
            payoutType,
          },
        }
      );

      setDeposits(response.data.deposits || []);
      setPagination(
        response.data.pagination || {
          currentPage,
          limit: PAGE_SIZE,
          totalRecords: 0,
          totalPages: 0,
        }
      );
    } catch (err) {
      console.error("Failed to fetch FD records:", err);
      setError("Unable to load fixed deposit records. Check whether the backend is running.");
      setDeposits([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch the complete dataset to calculate accurate dashboard figures.
  const fetchAllDeposits = async () => {
    try {
      setAnalyticsLoading(true);

      const firstResponse = await axios.get<DepositResponse>(
        `${API_URL}/deposits/list`,
        { params: { page: 1, limit: 100 } }
      );

      const firstPage = firstResponse.data;
      const totalPages = firstPage.pagination?.totalPages || 1;

      const remainingRequests = Array.from(
        { length: Math.max(0, totalPages - 1) },
        (_, index) =>
          axios.get<DepositResponse>(`${API_URL}/deposits/list`, {
            params: { page: index + 2, limit: 100 },
          })
      );

      const remainingResponses = await Promise.all(remainingRequests);

      const completeData = [
        ...(firstPage.deposits || []),
        ...remainingResponses.flatMap(
          (response) => response.data.deposits || []
        ),
      ];

      setAllDeposits(completeData);
    } catch (err) {
      console.error("Failed to load FD analytics:", err);
      setAllDeposits([]);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllDeposits();
  }, []);

  useEffect(() => {
    fetchTableData();
  }, [currentPage, search, status, payoutType]);

  // Calculate portfolio metrics from the complete dataset.
  const analytics = useMemo(() => {
    const total = allDeposits.length;

    const activeDeposits = allDeposits.filter(
      (item) => normalize(item.fd_status).toLowerCase() === "active"
    );

    const maturedDeposits = allDeposits.filter(
      (item) => normalize(item.fd_status).toLowerCase() === "matured"
    );

    const closedDeposits = allDeposits.filter(
      (item) => normalize(item.fd_status).toLowerCase() === "closed"
    );

    const totalPrincipal = allDeposits.reduce(
      (sum, item) => sum + money(item.principal_amount),
      0
    );

    const activePrincipal = activeDeposits.reduce(
      (sum, item) => sum + money(item.principal_amount),
      0
    );

    const maturedPrincipal = maturedDeposits.reduce(
      (sum, item) => sum + money(item.principal_amount),
      0
    );

    const statusCounts = allDeposits.reduce<Record<string, number>>(
      (result, item) => {
        const key = normalize(item.fd_status);
        result[key] = (result[key] || 0) + 1;
        return result;
      },
      {}
    );

    const payoutCounts = allDeposits.reduce<Record<string, number>>(
      (result, item) => {
        const key = normalize(item.payout_type);
        result[key] = (result[key] || 0) + 1;
        return result;
      },
      {}
    );

    const statusChart = Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
    }));

    const payoutChart = Object.entries(payoutCounts).map(([name, value]) => ({
      name,
      value,
    }));

    return {
      total,
      activeCount: activeDeposits.length,
      maturedCount: maturedDeposits.length,
      closedCount: closedDeposits.length,
      totalPrincipal,
      activePrincipal,
      maturedPrincipal,
      statusChart,
      payoutChart,
    };
  }, [allDeposits]);

  const resetFilters = () => {
    setSearch("");
    setStatus("");
    setPayoutType("");
    setCurrentPage(1);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleStatus = (value: string) => {
    setStatus(value);
    setCurrentPage(1);
  };

  const handlePayoutType = (value: string) => {
    setPayoutType(value);
    setCurrentPage(1);
  };

  return (
    <div className="deposit-page">
      <div className="deposit-page-header">
        <div>
          <h1>Fixed Deposit Management</h1>
          <p>Monitor fixed deposit investments, maturity status and payout preferences.</p>
        </div>

        <button
          className="deposit-refresh-btn"
          onClick={() => {
            fetchAllDeposits();
            fetchTableData();
          }}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="deposit-error">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="deposit-kpi-grid">
        <div className="deposit-kpi-card">
          <div className="deposit-kpi-top">
            <span>Total FD Accounts</span>
            <div className="deposit-kpi-icon blue">
              <Wallet size={20} />
            </div>
          </div>
          <h2>{analyticsLoading ? "—" : analytics.total.toLocaleString("en-IN")}</h2>
          <p>All fixed deposit records</p>
        </div>

        <div className="deposit-kpi-card">
          <div className="deposit-kpi-top">
            <span>Total FD Investment</span>
            <div className="deposit-kpi-icon purple">
              <Landmark size={20} />
            </div>
          </div>
          <h2>
            {analyticsLoading
              ? "—"
              : formatCompactCurrency(analytics.totalPrincipal)}
          </h2>
          <p>Combined principal amount</p>
        </div>

        <div className="deposit-kpi-card">
          <div className="deposit-kpi-top">
            <span>Active Deposits</span>
            <div className="deposit-kpi-icon green">
              <CheckCircle size={20} />
            </div>
          </div>
          <h2>
            {analyticsLoading
              ? "—"
              : analytics.activeCount.toLocaleString("en-IN")}
          </h2>
          <p>
            {analyticsLoading
              ? "Calculating..."
              : `${formatCompactCurrency(analytics.activePrincipal)} principal`}
          </p>
        </div>

        <div className="deposit-kpi-card">
          <div className="deposit-kpi-top">
            <span>Matured Deposits</span>
            <div className="deposit-kpi-icon orange">
              <CalendarCheck size={20} />
            </div>
          </div>
          <h2>
            {analyticsLoading
              ? "—"
              : analytics.maturedCount.toLocaleString("en-IN")}
          </h2>
          <p>
            {analyticsLoading
              ? "Calculating..."
              : `${formatCompactCurrency(analytics.maturedPrincipal)} principal`}
          </p>
        </div>
      </div>

      <div className="deposit-secondary-grid">
        <div className="deposit-panel deposit-chart-panel">
          <div className="deposit-panel-heading">
            <div>
              <h3>FD Status Distribution</h3>
              <p>Breakdown of deposits by current status</p>
            </div>
          </div>

          {analyticsLoading ? (
            <div className="deposit-chart-empty">Loading chart data...</div>
          ) : analytics.statusChart.length === 0 ? (
            <div className="deposit-chart-empty">No deposit data available.</div>
          ) : (
            <div className="deposit-chart">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.statusChart}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="48%"
                    outerRadius={105}
                    innerRadius={58}
                    paddingAngle={3}
                  >
                    {analytics.statusChart.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="deposit-panel deposit-chart-panel">
          <div className="deposit-panel-heading">
            <div>
              <h3>Payout Type Analysis</h3>
              <p>Number of deposits by payout preference</p>
            </div>
          </div>

          {analyticsLoading ? (
            <div className="deposit-chart-empty">Loading chart data...</div>
          ) : analytics.payoutChart.length === 0 ? (
            <div className="deposit-chart-empty">No payout data available.</div>
          ) : (
            <div className="deposit-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.payoutChart}
                  margin={{ top: 12, right: 12, left: 0, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar
                    dataKey="value"
                    name="Deposits"
                    fill="#4f46e5"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="deposit-insights-grid">
        <div className="deposit-insight-card">
          <div className="deposit-insight-icon green">
            <TrendingUp size={19} />
          </div>
          <div>
            <span>Active Principal</span>
            <strong>
              {analyticsLoading
                ? "—"
                : formatCurrency(analytics.activePrincipal)}
            </strong>
            <small>Principal in active deposits</small>
          </div>
        </div>

        <div className="deposit-insight-card">
          <div className="deposit-insight-icon orange">
            <CalendarCheck size={19} />
          </div>
          <div>
            <span>Matured Principal</span>
            <strong>
              {analyticsLoading
                ? "—"
                : formatCurrency(analytics.maturedPrincipal)}
            </strong>
            <small>Principal in matured deposits</small>
          </div>
        </div>

        <div className="deposit-insight-card">
          <div className="deposit-insight-icon gray">
            <Wallet size={19} />
          </div>
          <div>
            <span>Closed Deposits</span>
            <strong>
              {analyticsLoading
                ? "—"
                : analytics.closedCount.toLocaleString("en-IN")}
            </strong>
            <small>Deposits marked as closed</small>
          </div>
        </div>
      </div>

      <div className="deposit-panel deposit-records-panel">
        <div className="deposit-records-heading">
          <div>
            <h3>Fixed Deposit Records</h3>
            <p>
              {pagination.totalRecords.toLocaleString("en-IN")} records found
            </p>
          </div>
        </div>

        <div className="deposit-filters">
          <div className="deposit-search">
            <Search size={17} />
            <input
              type="text"
              placeholder="Search FD reference or customer ID..."
              value={search}
              onChange={(event) => handleSearch(event.target.value)}
            />
          </div>

          <select
            value={status}
            onChange={(event) => handleStatus(event.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Matured">Matured</option>
            <option value="Closed">Closed</option>
          </select>

          <select
            value={payoutType}
            onChange={(event) => handlePayoutType(event.target.value)}
          >
            <option value="">All Payout Types</option>
            {Array.from(
              new Set(
                allDeposits
                  .map((item) => normalize(item.payout_type))
                  .filter((item) => item !== "Unknown")
              )
            ).map((type) => (
              <option value={type} key={type}>
                {type}
              </option>
            ))}
          </select>

          <button className="deposit-reset-btn" onClick={resetFilters}>
            Reset
          </button>
        </div>

        <div className="deposit-table-wrapper">
          <table className="deposit-table">
            <thead>
              <tr>
                <th>FD Reference</th>
                <th>Customer ID</th>
                <th>Principal Amount</th>
                <th>Interest Rate</th>
                <th>Tenure</th>
                <th>Maturity Amount</th>
                <th>Maturity Date</th>
                <th>Payout Type</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="deposit-table-message">
                    Loading fixed deposit records...
                  </td>
                </tr>
              ) : deposits.length === 0 ? (
                <tr>
                  <td colSpan={9} className="deposit-table-message">
                    No fixed deposit records found.
                  </td>
                </tr>
              ) : (
                deposits.map((item) => (
                  <tr key={item.fd_id}>
                    <td className="deposit-reference">{item.fd_reference}</td>
                    <td>{item.customer_id}</td>
                    <td>{formatCurrency(money(item.principal_amount))}</td>
                    <td>{money(item.interest_rate).toFixed(2)}%</td>
                    <td>{item.tenure_months} months</td>
                    <td>
                      {item.maturity_amount == null
                        ? "—"
                        : formatCurrency(money(item.maturity_amount))}
                    </td>
                    <td>{formatDate(item.maturity_date)}</td>
                    <td>{normalize(item.payout_type)}</td>
                    <td>
                      <span
                        className={`deposit-status-badge ${normalize(
                          item.fd_status
                        )
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {normalize(item.fd_status)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="deposit-pagination">
          <span>
            Page {pagination.currentPage || 1} of {pagination.totalPages || 1}
          </span>

          <div>
            <button
              disabled={currentPage <= 1 || loading}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            >
              Previous
            </button>
            <button
              disabled={
                currentPage >= (pagination.totalPages || 1) || loading
              }
              onClick={() =>
                setCurrentPage((page) =>
                  Math.min(pagination.totalPages || 1, page + 1)
                )
              }
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <p className="deposit-data-note">
        Dashboard figures are calculated from the project's synthetic dataset.
        They are illustrative analytics and do not represent actual bank customer
        or deposit records.
      </p>
    </div>
  );
}

export default Deposits;
