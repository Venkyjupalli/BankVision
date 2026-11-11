
import { useEffect, useState } from "react";
import { useAppSettings } from "../context/SettingsContext";
import axios from "axios";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  Crown,
  Award,
  UserRound,
  RefreshCw,
  MapPin,
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

interface Customer {
  customer_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  occupation: string;
  customer_segment: string;
}

interface SegmentData {
  name: string;
  value: number;
}

interface CustomerResponse {
  customers: Customer[];
  pagination: {
    currentPage: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
  };
}

const SEGMENT_COLORS: Record<string, string> = {
  VIP: "#315bd6",
  Premium: "#8b5cf6",
  Regular: "#10b981",
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-IN").format(value || 0);

export default function Customers() {
    const { preferences } = useAppSettings();

const rowsPerPage = Number(preferences.tableRows) || 10;
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [segments, setSegments] = useState<SegmentData[]>([]);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      setError("");

      const [segmentResponse, customerResponse] = await Promise.all([
        axios.get<SegmentData[]>(`${API_URL}/customers`),
        axios.get<CustomerResponse>(`${API_URL}/customers/list`, {
          params: {
            page,
            limit: rowsPerPage,
            search: search.trim(),
          },
        }),
      ]);

      setSegments(
        segmentResponse.data.map((item) => ({
          name: item.name,
          value: Number(item.value) || 0,
        }))
      );

      setCustomers(customerResponse.data.customers);
      setTotalPages(
        Math.max(1, customerResponse.data.pagination.totalPages)
      );
      setTotalRecords(
        Number(customerResponse.data.pagination.totalRecords) || 0
      );
    } catch (err) {
      console.error("Customer dashboard error:", err);
      setError("Unable to load customer information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  setPage(1);
}, [rowsPerPage]);

useEffect(() => {
  setPage(1);
}, [rowsPerPage]);

useEffect(() => {
  setPage(1);
}, [rowsPerPage]);

useEffect(() => {
  setPage(1);
}, [rowsPerPage]);

useEffect(() => {
  fetchCustomerData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [page, search, rowsPerPage]);

  const getSegmentCount = (segmentName: string) =>
    segments.find(
      (segment) => segment.name.toLowerCase() === segmentName.toLowerCase()
    )?.value || 0;

  const vipCount = getSegmentCount("VIP");
  const premiumCount = getSegmentCount("Premium");
  const regularCount = getSegmentCount("Regular");

  const chartData = segments.map((segment) => ({
    ...segment,
    color:
      SEGMENT_COLORS[segment.name] ||
      "#94a3b8",
  }));

  const totalSegmentCustomers = segments.reduce(
    (sum, segment) => sum + segment.value,
    0
  );

  const getPercentage = (value: number) =>
    totalSegmentCustomers > 0
      ? ((value / totalSegmentCustomers) * 100).toFixed(1)
      : "0.0";

  const getSegmentClass = (segment: string) => {
    const normalized = segment.toLowerCase();
    if (normalized === "vip") return "customer-segment-badge vip";
    if (normalized === "premium") return "customer-segment-badge premium";
    return "customer-segment-badge regular";
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="customer-dashboard">
      {/* PAGE HEADER */}
      <div className="customer-page-header">
        <div>
          <h1>Customer Intelligence</h1>
          <p>
            Understand customer segments and explore registered customer
            profiles.
          </p>
        </div>

        <button
          className="customer-refresh-btn"
          onClick={fetchCustomerData}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh Data
        </button>
      </div>

      {error && <div className="customer-error">{error}</div>}

      {/* CUSTOMER KPI CARDS */}
      <div className="customer-stats-grid">
        <div className="customer-stat-card">
          <div className="customer-stat-icon total">
            <Users size={23} />
          </div>
          <div>
            <p>Total Customers</p>
            <h2>{loading ? "â€”" : formatNumber(totalRecords)}</h2>
            <span>Registered customer records</span>
          </div>
        </div>

        <div className="customer-stat-card">
          <div className="customer-stat-icon vip">
            <Crown size={23} />
          </div>
          <div>
            <p>VIP Customers</p>
            <h2>{loading ? "â€”" : formatNumber(vipCount)}</h2>
            <span>{getPercentage(vipCount)}% of customer segments</span>
          </div>
        </div>

        <div className="customer-stat-card">
          <div className="customer-stat-icon premium">
            <Award size={23} />
          </div>
          <div>
            <p>Premium Customers</p>
            <h2>{loading ? "â€”" : formatNumber(premiumCount)}</h2>
            <span>{getPercentage(premiumCount)}% of customer segments</span>
          </div>
        </div>

        <div className="customer-stat-card">
          <div className="customer-stat-icon regular">
            <UserRound size={23} />
          </div>
          <div>
            <p>Regular Customers</p>
            <h2>{loading ? "â€”" : formatNumber(regularCount)}</h2>
            <span>{getPercentage(regularCount)}% of customer segments</span>
          </div>
        </div>
      </div>

      {/* CUSTOMER ANALYTICS */}
      <div className="customer-analytics-grid">
        <section className="customer-chart-card">
          <div className="customer-section-heading">
            <div>
              <h2>Customer Segment Distribution</h2>
              <p>Share of customers across banking segments</p>
            </div>
          </div>

          <div className="customer-pie-chart">
            {loading ? (
              <div className="customer-chart-message">
                Loading customer analytics...
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

        <section className="customer-chart-card">
          <div className="customer-section-heading">
            <div>
              <h2>Segment Comparison</h2>
              <p>Customer count by segment</p>
            </div>
          </div>

          <div className="customer-bar-chart">
            {loading ? (
              <div className="customer-chart-message">
                Loading customer analytics...
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
                    name="Customers"
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

      {/* SEGMENT BREAKDOWN */}
      <section className="customer-breakdown-card">
        <div className="customer-section-heading">
          <div>
            <h2>Customer Segment Overview</h2>
            <p>Customer distribution and percentage contribution</p>
          </div>
        </div>

        <div className="customer-segment-list">
          {segments.map((segment) => (
            <div className="customer-segment-row" key={segment.name}>
              <div className="customer-segment-info">
                <span
                  className="customer-segment-dot"
                  style={{
                    background:
                      SEGMENT_COLORS[segment.name] || "#94a3b8",
                  }}
                />
                <strong>{segment.name}</strong>
              </div>

              <div className="customer-segment-progress">
                <div className="customer-progress-track">
                  <div
                    className="customer-progress-fill"
                    style={{
                      width: `${getPercentage(segment.value)}%`,
                      background:
                        SEGMENT_COLORS[segment.name] || "#94a3b8",
                    }}
                  />
                </div>
              </div>

              <strong className="customer-segment-value">
                {formatNumber(segment.value)}
              </strong>

              <span className="customer-segment-percentage">
                {getPercentage(segment.value)}%
              </span>
            </div>
          ))}
          {!loading && segments.length === 0 && (
            <p className="customer-chart-message">
              No customer segment data available.
            </p>
          )}
        </div>
      </section>

      {/* CUSTOMER RECORDS */}
      <section className="customer-records-card">
        <div className="customer-records-header">
          <div>
            <h2>Customer Records</h2>
            <p>Search and explore registered customer information</p>
          </div>

          <span className="customer-record-count">
            {formatNumber(totalRecords)} records
          </span>
        </div>

        <div className="customer-toolbar">
          <div className="customer-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search name, email, phone or city..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="customer-table-wrapper">
          <table className="customer-table">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Customer Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Location</th>
                <th>Occupation</th>
                <th>Segment</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="customer-table-message">
                    Loading customer records...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="customer-table-message">
                    No customers found.
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.customer_id}>
                    <td className="customer-id">
                      #{customer.customer_id}
                    </td>

                    <td>
                      <div className="customer-name-cell">
                        <div className="customer-avatar">
                          {customer.first_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong>
                            {customer.first_name} {customer.last_name}
                          </strong>
                          <small>Customer #{customer.customer_id}</small>
                        </div>
                      </div>
                    </td>

                    <td>{customer.email}</td>
                    <td>{customer.phone}</td>

                    <td>
                      <div className="customer-location">
                        <MapPin size={13} />
                        {customer.city}, {customer.state}
                      </div>
                    </td>

                    <td>{customer.occupation}</td>

                    <td>
                      <span
                        className={getSegmentClass(
                          customer.customer_segment
                        )}
                      >
                        {customer.customer_segment}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="customer-pagination">
          <span>
            Showing {loading ? 0 : customers.length} of{" "}
            {formatNumber(totalRecords)} customers
          </span>

          <div className="customer-pagination-controls">
            <button
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1 || loading}
            >
              <ChevronLeft size={17} />
              Previous
            </button>

            <span>
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              disabled={page >= totalPages || loading}
            >
              Next
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </section>

      <p className="customer-disclaimer">
        Customer information and segment classifications are based on
        BankVision's synthetic demonstration dataset.
      </p>
    </div>
  );
}
