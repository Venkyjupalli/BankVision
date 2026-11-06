
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowLeftRight,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Activity,
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

interface Transaction {
  transaction_id: number;
  transaction_reference: string;
  account_id: number;
  transaction_type: string;
  transaction_category: string | null;
  amount: number | string;
  transaction_date: string;
  transaction_mode: string | null;
  transaction_status: string;
}

interface TransactionAnalytics {
  name: string;
  value: number;
}

interface Pagination {
  currentPage: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
}

interface TransactionResponse {
  transactions: Transaction[];
  pagination: Pagination;
}

const STATUS_COLORS: Record<string, string> = {
  Success: "#10b981",
  Failed: "#ef4444",
  Pending: "#f59e0b",
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-IN").format(value || 0);

const formatAmount = (amount: number | string) =>
  Number(amount).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });

const formatDate = (date: string) =>
  new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [analytics, setAnalytics] = useState<TransactionAnalytics[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [mode, setMode] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTransactionData = async () => {
    try {
      setLoading(true);
      setError("");

      const [analyticsResponse, transactionResponse] = await Promise.all([
        axios.get<TransactionAnalytics[]>(`${API_URL}/transactions`),
        axios.get<TransactionResponse>(`${API_URL}/transactions/list`, {
          params: {
            page,
            limit: 10,
            search: search.trim(),
            status,
            type: type.trim(),
            mode: mode.trim(),
          },
        }),
      ]);

      setAnalytics(
        analyticsResponse.data.map((item) => ({
          name: item.name,
          value: Number(item.value) || 0,
        }))
      );

      setTransactions(transactionResponse.data.transactions);
      setPagination(transactionResponse.data.pagination);
    } catch (err) {
      console.error("Transaction dashboard error:", err);
      setError("Unable to load transaction information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactionData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, status, type, mode]);

  const getStatusCount = (statusName: string) =>
    analytics.find(
      (item) => item.name.toLowerCase() === statusName.toLowerCase()
    )?.value || 0;

  const successCount = getStatusCount("Success");
  const failedCount = getStatusCount("Failed");
  const pendingCount = getStatusCount("Pending");

  const totalTransactions = analytics.reduce(
    (sum, item) => sum + item.value,
    0
  );

  const successRate =
    totalTransactions > 0
      ? ((successCount / totalTransactions) * 100).toFixed(1)
      : "0.0";

  const chartData = analytics.map((item) => ({
    ...item,
    color: STATUS_COLORS[item.name] || "#94a3b8",
  }));

  const getStatusClass = (value: string) => {
    const normalized = value.toLowerCase();

    if (normalized === "success") {
      return "transaction-status-badge success";
    }

    if (normalized === "failed") {
      return "transaction-status-badge failed";
    }

    return "transaction-status-badge pending";
  };

  const handleFilterChange = (
    setter: (value: string) => void,
    value: string
  ) => {
    setter(value);
    setPage(1);
  };

  return (
    <div className="transaction-dashboard">
      {/* PAGE HEADER */}
      <div className="transaction-page-header">
        <div>
          <h1>Transaction Intelligence</h1>
          <p>
            Monitor transaction activity, processing status and banking
            transaction records.
          </p>
        </div>

        <button
          className="transaction-refresh-btn"
          onClick={fetchTransactionData}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh Data
        </button>
      </div>

      {error && <div className="transaction-error">{error}</div>}

      {/* KPI CARDS */}
      <div className="transaction-stats-grid">
        <div className="transaction-stat-card">
          <div className="transaction-stat-icon total">
            <ArrowLeftRight size={23} />
          </div>
          <div>
            <p>Total Transactions</p>
            <h2>{loading ? "—" : formatNumber(totalTransactions)}</h2>
            <span>All recorded transactions</span>
          </div>
        </div>

        <div className="transaction-stat-card">
          <div className="transaction-stat-icon success">
            <CheckCircle2 size={23} />
          </div>
          <div>
            <p>Successful Transactions</p>
            <h2>{loading ? "—" : formatNumber(successCount)}</h2>
            <span>Successfully processed</span>
          </div>
        </div>

        <div className="transaction-stat-card">
          <div className="transaction-stat-icon failed">
            <XCircle size={23} />
          </div>
          <div>
            <p>Failed Transactions</p>
            <h2>{loading ? "—" : formatNumber(failedCount)}</h2>
            <span>Unsuccessful transactions</span>
          </div>
        </div>

        <div className="transaction-stat-card">
          <div className="transaction-stat-icon pending">
            <Clock size={23} />
          </div>
          <div>
            <p>Pending Transactions</p>
            <h2>{loading ? "—" : formatNumber(pendingCount)}</h2>
            <span>Awaiting completion</span>
          </div>
        </div>
      </div>

      {/* SUCCESS RATE */}
      <section className="transaction-success-card">
        <div className="transaction-success-icon">
          <Activity size={23} />
        </div>

        <div className="transaction-success-info">
          <p>Transaction Success Rate</p>
          <h2>{loading ? "—" : `${successRate}%`}</h2>
          <span>Successful transactions as a share of all recorded transactions</span>
        </div>

        <div className="transaction-success-progress">
          <div className="transaction-success-track">
            <div
              className="transaction-success-fill"
              style={{
                width: `${successRate}%`,
              }}
            />
          </div>
          <span>{loading ? "Loading..." : `${successRate}% successful`}</span>
        </div>
      </section>

      {/* ANALYTICS */}
      <div className="transaction-analytics-grid">
        <section className="transaction-chart-card">
          <div className="transaction-section-heading">
            <div>
              <h2>Transaction Status Distribution</h2>
              <p>Share of transactions by processing status</p>
            </div>
          </div>

          <div className="transaction-pie-chart">
            {loading ? (
              <div className="transaction-chart-message">
                Loading transaction analytics...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="47%"
                    innerRadius={65}
                    outerRadius={105}
                    paddingAngle={3}
                  >
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
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

        <section className="transaction-chart-card">
          <div className="transaction-section-heading">
            <div>
              <h2>Status Comparison</h2>
              <p>Transaction count by processing status</p>
            </div>
          </div>

          <div className="transaction-bar-chart">
            {loading ? (
              <div className="transaction-chart-message">
                Loading transaction analytics...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
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
                    name="Transactions"
                    radius={[7, 7, 0, 0]}
                    barSize={55}
                  >
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      </div>

      {/* STATUS BREAKDOWN */}
      <section className="transaction-breakdown-card">
        <div className="transaction-section-heading">
          <div>
            <h2>Transaction Status Overview</h2>
            <p>Processing status and percentage contribution</p>
          </div>
        </div>

        <div className="transaction-breakdown-list">
          {chartData.map((item) => {
            const percentage =
              totalTransactions > 0
                ? (item.value / totalTransactions) * 100
                : 0;

            return (
              <div className="transaction-breakdown-row" key={item.name}>
                <div className="transaction-breakdown-label">
                  <span
                    className="transaction-breakdown-dot"
                    style={{ background: item.color }}
                  />
                  <strong>{item.name}</strong>
                </div>

                <div className="transaction-breakdown-progress">
                  <div className="transaction-breakdown-track">
                    <div
                      className="transaction-breakdown-fill"
                      style={{
                        width: `${percentage}%`,
                        background: item.color,
                      }}
                    />
                  </div>
                </div>

                <strong className="transaction-breakdown-value">
                  {formatNumber(item.value)}
                </strong>

                <span className="transaction-breakdown-percentage">
                  {percentage.toFixed(1)}%
                </span>
              </div>
            );
          })}

          {!loading && chartData.length === 0 && (
            <p className="transaction-chart-message">
              No transaction analytics available.
            </p>
          )}
        </div>
      </section>

      {/* TRANSACTION RECORDS */}
      <section className="transaction-records-card">
        <div className="transaction-records-header">
          <div>
            <h2>Transaction Records</h2>
            <p>Search, filter and explore banking transaction details</p>
          </div>

          <span className="transaction-record-count">
            {formatNumber(pagination?.totalRecords || 0)} records
          </span>
        </div>

        <div className="transaction-filter-toolbar">
          <div className="transaction-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search transaction reference..."
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
            <option value="Success">Success</option>
            <option value="Failed">Failed</option>
            <option value="Pending">Pending</option>
          </select>

          <input
            type="text"
            placeholder="Transaction type"
            value={type}
            onChange={(e) =>
              handleFilterChange(setType, e.target.value)
            }
          />

          <input
            type="text"
            placeholder="Transaction mode"
            value={mode}
            onChange={(e) =>
              handleFilterChange(setMode, e.target.value)
            }
          />
        </div>

        <div className="transaction-table-wrapper">
          <table className="transaction-data-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Reference</th>
                <th>Account ID</th>
                <th>Type</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Mode</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="transaction-table-message">
                    Loading transaction records...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="transaction-table-message">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction.transaction_id}>
                    <td className="transaction-id">
                      #{transaction.transaction_id}
                    </td>

                    <td className="transaction-reference">
                      {transaction.transaction_reference}
                    </td>

                    <td>{transaction.account_id}</td>
                    <td>{transaction.transaction_type}</td>
                    <td>{transaction.transaction_category || "—"}</td>

                    <td className="transaction-amount">
                      {formatAmount(transaction.amount)}
                    </td>

                    <td>{formatDate(transaction.transaction_date)}</td>
                    <td>{transaction.transaction_mode || "—"}</td>

                    <td>
                      <span
                        className={getStatusClass(
                          transaction.transaction_status
                        )}
                      >
                        {transaction.transaction_status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="transaction-pagination">
          <span>
            Showing {loading ? 0 : transactions.length} of{" "}
            {formatNumber(pagination?.totalRecords || 0)} transactions
          </span>

          <div className="transaction-pagination-controls">
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

      <p className="transaction-disclaimer">
        Transaction analytics are based on BankVision's synthetic demonstration
        dataset. Status counts are aggregate records, not live banking activity.
      </p>
    </div>
  );
}
