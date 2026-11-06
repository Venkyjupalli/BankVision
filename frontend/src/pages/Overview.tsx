
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Users,
  Wallet,
  Landmark,
  ArrowLeftRight,
  RefreshCw,
  AlertCircle,
  TrendingUp,
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

const COLORS = ["#4f46e5", "#0d9488", "#f59e0b", "#64748b", "#e879f9"];

interface Summary {
  totalCustomers: number;
  totalAccounts: number;
  totalLoans: number;
  totalTransactions: number;
}

interface DistributionItem {
  name: string;
  value: number | string;
}

interface BranchBalance {
  branch: string;
  balance: number | string;
}

interface BranchLoan {
  branch: string;
  outstanding: number | string;
}

interface BranchDeposit {
  branch: string;
  investment: number | string;
}

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-IN").format(value);

const formatCrores = (value: number) =>
  `₹${value.toFixed(2)} Cr`;

function Overview() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [customerData, setCustomerData] = useState<DistributionItem[]>([]);
  const [transactionData, setTransactionData] = useState<DistributionItem[]>([]);
  const [branchBalances, setBranchBalances] = useState<BranchBalance[]>([]);
  const [loanData, setLoanData] = useState<BranchLoan[]>([]);
  const [depositData, setDepositData] = useState<BranchDeposit[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOverviewData = useCallback(async () => {
    setLoading(true);
    setError("");

    const requests = await Promise.allSettled([
      axios.get(`${API_URL}/summary`),
      axios.get(`${API_URL}/customers`),
      axios.get(`${API_URL}/transactions`),
      axios.get(`${API_URL}/branches`),
      axios.get(`${API_URL}/loans`),
      axios.get(`${API_URL}/deposits`),
    ]);

    let failedRequests = 0;

    if (requests[0].status === "fulfilled") {
      setSummary(requests[0].value.data);
    } else {
      failedRequests++;
      console.error("Summary API error:", requests[0].reason);
    }

    if (requests[1].status === "fulfilled") {
      setCustomerData(requests[1].value.data || []);
    } else {
      failedRequests++;
      console.error("Customer analytics API error:", requests[1].reason);
    }

    if (requests[2].status === "fulfilled") {
      setTransactionData(requests[2].value.data || []);
    } else {
      failedRequests++;
      console.error("Transaction analytics API error:", requests[2].reason);
    }

    if (requests[3].status === "fulfilled") {
      setBranchBalances(requests[3].value.data || []);
    } else {
      failedRequests++;
      console.error("Branch analytics API error:", requests[3].reason);
    }

    if (requests[4].status === "fulfilled") {
      setLoanData(requests[4].value.data || []);
    } else {
      failedRequests++;
      console.error("Loan analytics API error:", requests[4].reason);
    }

    if (requests[5].status === "fulfilled") {
      setDepositData(requests[5].value.data || []);
    } else {
      failedRequests++;
      console.error("Deposit analytics API error:", requests[5].reason);
    }

    if (failedRequests > 0) {
      setError(
        `${failedRequests} dashboard data source(s) could not be loaded. Check the backend terminal and browser console.`
      );
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOverviewData();
  }, [fetchOverviewData]);

  const financialByBranch = useMemo(() => {
    const loans = new Map(
      loanData.map((item) => [item.branch, Number(item.outstanding) || 0])
    );

    const deposits = new Map(
      depositData.map((item) => [item.branch, Number(item.investment) || 0])
    );

    return branchBalances
      .map((branch) => ({
        branch: branch.branch,
        balance: Number(branch.balance) || 0,
        outstanding: loans.get(branch.branch) || 0,
        investment: deposits.get(branch.branch) || 0,
      }))
      .sort((a, b) => b.balance - a.balance);
  }, [branchBalances, loanData, depositData]);

  const totalAccountBalance = useMemo(
    () =>
      branchBalances.reduce(
        (sum, item) => sum + (Number(item.balance) || 0),
        0
      ),
    [branchBalances]
  );

  const totalLoanOutstanding = useMemo(
    () =>
      loanData.reduce(
        (sum, item) => sum + (Number(item.outstanding) || 0),
        0
      ),
    [loanData]
  );

  const totalDepositInvestment = useMemo(
    () =>
      depositData.reduce(
        (sum, item) => sum + (Number(item.investment) || 0),
        0
      ),
    [depositData]
  );

  const transactionTotal = transactionData.reduce(
    (sum, item) => sum + (Number(item.value) || 0),
    0
  );

  const successfulTransactions = transactionData
    .filter((item) => item.name.toLowerCase() === "success")
    .reduce((sum, item) => sum + (Number(item.value) || 0), 0);

  const successRate =
    transactionTotal > 0
      ? (successfulTransactions / transactionTotal) * 100
      : 0;

  const topBalanceBranches = financialByBranch.slice(0, 8);

  const financialChartData = financialByBranch.slice(0, 10);

  const stats = [
    {
      title: "Total Customers",
      value: summary ? formatNumber(Number(summary.totalCustomers)) : "—",
      description: "Registered customer records",
      icon: Users,
      iconClass: "overview-blue",
    },
    {
      title: "Total Accounts",
      value: summary ? formatNumber(Number(summary.totalAccounts)) : "—",
      description: "Bank account records",
      icon: Wallet,
      iconClass: "overview-purple",
    },
    {
      title: "Total Loans",
      value: summary ? formatNumber(Number(summary.totalLoans)) : "—",
      description: "Loan records",
      icon: Landmark,
      iconClass: "overview-green",
    },
    {
      title: "Total Transactions",
      value: summary ? formatNumber(Number(summary.totalTransactions)) : "—",
      description: "Transaction records",
      icon: ArrowLeftRight,
      iconClass: "overview-orange",
    },
  ];

  return (
    <div className="overview-page">
      <div className="overview-header">
        <div>
          <h1>Banking Overview</h1>
          <p>
            A consolidated view of customer activity, accounts and banking
            portfolio analytics.
          </p>
        </div>

        <button
          className="overview-refresh-btn"
          onClick={fetchOverviewData}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "overview-spinning" : ""} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="overview-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="overview-kpi-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div className="overview-kpi-card" key={stat.title}>
              <div className="overview-kpi-top">
                <span>{stat.title}</span>
                <div className={`overview-kpi-icon ${stat.iconClass}`}>
                  <Icon size={20} />
                </div>
              </div>

              <h2>{loading ? "—" : stat.value}</h2>
              <p>{stat.description}</p>
            </div>
          );
        })}
      </div>

      <div className="overview-financial-grid">
        <div className="overview-financial-card">
          <div className="overview-financial-icon blue">
            <Wallet size={19} />
          </div>
          <div>
            <span>Total Account Balance</span>
            <strong>
              {loading ? "—" : formatCrores(totalAccountBalance)}
            </strong>
            <small>Aggregated from branch account balances</small>
          </div>
        </div>

        <div className="overview-financial-card">
          <div className="overview-financial-icon purple">
            <Landmark size={19} />
          </div>
          <div>
            <span>Loan Outstanding</span>
            <strong>
              {loading ? "—" : formatCrores(totalLoanOutstanding)}
            </strong>
            <small>Aggregated branch-level outstanding amount</small>
          </div>
        </div>

        <div className="overview-financial-card">
          <div className="overview-financial-icon green">
            <TrendingUp size={19} />
          </div>
          <div>
            <span>FD Investment</span>
            <strong>
              {loading ? "—" : formatCrores(totalDepositInvestment)}
            </strong>
            <small>Aggregated branch-level FD principal</small>
          </div>
        </div>
      </div>

      <div className="overview-chart-grid">
        <div className="overview-panel">
          <div className="overview-panel-heading">
            <div>
              <h3>Customer Segmentation</h3>
              <p>Customer distribution by segment</p>
            </div>
          </div>

          {loading ? (
            <div className="overview-chart-empty">Loading chart...</div>
          ) : customerData.length === 0 ? (
            <div className="overview-chart-empty">No customer data available.</div>
          ) : (
            <div className="overview-chart">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={customerData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="47%"
                    outerRadius={105}
                    innerRadius={55}
                    paddingAngle={3}
                  >
                    {customerData.map((item, index) => (
                      <Cell
                        key={item.name}
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

        <div className="overview-panel">
          <div className="overview-panel-heading">
            <div>
              <h3>Transaction Status</h3>
              <p>Distribution of transaction records by status</p>
            </div>
          </div>

          {loading ? (
            <div className="overview-chart-empty">Loading chart...</div>
          ) : transactionData.length === 0 ? (
            <div className="overview-chart-empty">
              No transaction data available.
            </div>
          ) : (
            <div className="overview-chart">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={transactionData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="47%"
                    outerRadius={105}
                    innerRadius={55}
                    paddingAngle={3}
                  >
                    {transactionData.map((item, index) => (
                      <Cell
                        key={item.name}
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

          <div className="overview-chart-caption">
            <span>Transaction success rate</span>
            <strong>{loading ? "—" : `${successRate.toFixed(2)}%`}</strong>
          </div>
        </div>
      </div>

      <div className="overview-panel">
        <div className="overview-panel-heading">
          <div>
            <h3>Account Balance by Branch</h3>
            <p>Top branches ranked by account balance (₹ Crores)</p>
          </div>
        </div>

        {loading ? (
          <div className="overview-chart-empty">Loading chart...</div>
        ) : topBalanceBranches.length === 0 ? (
          <div className="overview-chart-empty">No branch data available.</div>
        ) : (
          <div className="overview-wide-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topBalanceBranches}
                margin={{ top: 15, right: 20, left: 8, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="branch"
                  tick={{ fontSize: 11 }}
                  interval={0}
                  angle={-12}
                  textAnchor="end"
                  height={55}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value) => [
                    `₹${Number(value).toFixed(2)} Cr`,
                    "Account Balance",
                  ]}
                />
                <Bar
                  dataKey="balance"
                  name="Account Balance"
                  fill="#4f46e5"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="overview-panel">
        <div className="overview-panel-heading">
          <div>
            <h3>Loan and Deposit Comparison</h3>
            <p>Branch-level loan outstanding and FD investment (₹ Crores)</p>
          </div>
        </div>

        {loading ? (
          <div className="overview-chart-empty">Loading chart...</div>
        ) : financialChartData.length === 0 ? (
          <div className="overview-chart-empty">
            No financial analytics available.
          </div>
        ) : (
          <div className="overview-wide-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={financialChartData}
                margin={{ top: 15, right: 20, left: 8, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="branch"
                  tick={{ fontSize: 11 }}
                  interval={0}
                  angle={-12}
                  textAnchor="end"
                  height={55}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value, name) => [
                    `₹${Number(value).toFixed(2)} Cr`,
                    name,
                  ]}
                />
                <Legend />
                <Bar
                  dataKey="outstanding"
                  name="Loan Outstanding"
                  fill="#0d9488"
                  radius={[5, 5, 0, 0]}
                />
                <Bar
                  dataKey="investment"
                  name="FD Investment"
                  fill="#f59e0b"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="overview-footer-note">
        BankVision uses synthetic demonstration data. These figures are
        illustrative and do not represent actual bank operations or customers.
      </div>
    </div>
  );
}

export default Overview;
