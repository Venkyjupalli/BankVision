
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Building2,
  MapPin,
  Map,
  Search,
  RefreshCw,
  Users,
  Landmark,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const API_URL = "http://localhost:5000/api/dashboard";
const PAGE_SIZE = 10;

interface Branch {
  branch_id: number;
  branch_name: string;
  branch_code: string;
  city: string;
  state: string;
  ifsc_code: string;
  manager_name: string;
}

interface Pagination {
  currentPage: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
}

interface BranchResponse {
  branches: Branch[];
  pagination: Pagination;
}

function Branches() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [allBranches, setAllBranches] = useState<Branch[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    limit: PAGE_SIZE,
    totalRecords: 0,
    totalPages: 0,
  });

  const [search, setSearch] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBranchTable = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get<BranchResponse>(
        `${API_URL}/branches/list`,
        {
          params: {
            page: currentPage,
            limit: PAGE_SIZE,
            search: search.trim(),
          },
        }
      );

      let records = response.data.branches || [];

      if (selectedState) {
        records = records.filter(
          (branch) =>
            (branch.state || "").toLowerCase() === selectedState.toLowerCase()
        );
      }

      setBranches(records);
      setPagination(
        response.data.pagination || {
          currentPage,
          limit: PAGE_SIZE,
          totalRecords: 0,
          totalPages: 0,
        }
      );
    } catch (err) {
      console.error("Failed to fetch branches:", err);
      setError(
        "Unable to load branch records. Check whether the backend is running."
      );
      setBranches([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllBranches = async () => {
    try {
      setAnalyticsLoading(true);

      const response = await axios.get<BranchResponse>(
        `${API_URL}/branches/list`,
        {
          params: {
            page: 1,
            limit: 100,
          },
        }
      );

      setAllBranches(response.data.branches || []);
    } catch (err) {
      console.error("Failed to load branch analytics:", err);
      setAllBranches([]);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBranches();
  }, []);

  useEffect(() => {
    fetchBranchTable();
  }, [currentPage, search, selectedState]);

  const analytics = useMemo(() => {
    const stateCounts: Record<string, number> = {};
    const cityCounts: Record<string, number> = {};

    allBranches.forEach((branch) => {
      const state = (branch.state || "Unknown").trim();
      const city = (branch.city || "Unknown").trim();

      stateCounts[state] = (stateCounts[state] || 0) + 1;
      cityCounts[city] = (cityCounts[city] || 0) + 1;
    });

    const stateChart = Object.entries(stateCounts)
      .map(([name, count]) => ({ name, branches: count }))
      .sort((a, b) => b.branches - a.branches);

    const cityChart = Object.entries(cityCounts)
      .map(([name, count]) => ({ name, branches: count }))
      .sort((a, b) => b.branches - a.branches)
      .slice(0, 8);

    return {
      totalBranches: allBranches.length,
      totalStates: Object.keys(stateCounts).length,
      totalCities: Object.keys(cityCounts).length,
      stateChart,
      cityChart,
      states: Object.keys(stateCounts).sort(),
    };
  }, [allBranches]);

  const resetFilters = () => {
    setSearch("");
    setSelectedState("");
    setCurrentPage(1);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleStateChange = (value: string) => {
    setSelectedState(value);
    setCurrentPage(1);
  };

  const filteredCount = selectedState
    ? branches.length
    : pagination.totalRecords;

  return (
    <div className="branch-page">
      <div className="branch-page-header">
        <div>
          <h1>Branch Management</h1>
          <p>Explore branch locations, geographic coverage and branch directory.</p>
        </div>

        <button
          className="branch-refresh-btn"
          onClick={() => {
            fetchAllBranches();
            fetchBranchTable();
          }}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && <div className="branch-error">{error}</div>}

      <div className="branch-kpi-grid">
        <div className="branch-kpi-card">
          <div className="branch-kpi-top">
            <span>Total Branches</span>
            <div className="branch-kpi-icon blue">
              <Building2 size={20} />
            </div>
          </div>
          <h2>
            {analyticsLoading ? "—" : analytics.totalBranches}
          </h2>
          <p>Branches in the directory</p>
        </div>

        <div className="branch-kpi-card">
          <div className="branch-kpi-top">
            <span>States Covered</span>
            <div className="branch-kpi-icon purple">
              <Map size={20} />
            </div>
          </div>
          <h2>
            {analyticsLoading ? "—" : analytics.totalStates}
          </h2>
          <p>Unique states represented</p>
        </div>

        <div className="branch-kpi-card">
          <div className="branch-kpi-top">
            <span>Cities Covered</span>
            <div className="branch-kpi-icon green">
              <MapPin size={20} />
            </div>
          </div>
          <h2>
            {analyticsLoading ? "—" : analytics.totalCities}
          </h2>
          <p>Unique cities represented</p>
        </div>

        <div className="branch-kpi-card">
          <div className="branch-kpi-top">
            <span>Branch Managers</span>
            <div className="branch-kpi-icon orange">
              <Users size={20} />
            </div>
          </div>
          <h2>
            {analyticsLoading
              ? "—"
              : new Set(
                  allBranches
                    .map((branch) => branch.manager_name)
                    .filter(Boolean)
                ).size}
          </h2>
          <p>Unique manager names listed</p>
        </div>
      </div>

      <div className="branch-chart-grid">
        <div className="branch-panel">
          <div className="branch-panel-heading">
            <div>
              <h3>Branches by State</h3>
              <p>Geographic distribution across states</p>
            </div>
          </div>

          {analyticsLoading ? (
            <div className="branch-chart-empty">Loading chart data...</div>
          ) : analytics.stateChart.length === 0 ? (
            <div className="branch-chart-empty">No branch data available.</div>
          ) : (
            <div className="branch-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.stateChart}
                  margin={{ top: 12, right: 12, left: 0, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar
                    dataKey="branches"
                    name="Branches"
                    fill="#4f46e5"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="branch-panel">
          <div className="branch-panel-heading">
            <div>
              <h3>Top Cities by Branch Count</h3>
              <p>Top eight cities in the branch directory</p>
            </div>
          </div>

          {analyticsLoading ? (
            <div className="branch-chart-empty">Loading chart data...</div>
          ) : analytics.cityChart.length === 0 ? (
            <div className="branch-chart-empty">No branch data available.</div>
          ) : (
            <div className="branch-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.cityChart}
                  layout="vertical"
                  margin={{ top: 8, right: 18, left: 12, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={90}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip />
                  <Bar
                    dataKey="branches"
                    name="Branches"
                    fill="#0d9488"
                    radius={[0, 6, 6, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="branch-panel branch-directory-panel">
        <div className="branch-directory-heading">
          <div>
            <h3>Branch Directory</h3>
            <p>
              {selectedState
                ? `${filteredCount} branch records on this page`
                : `${pagination.totalRecords.toLocaleString("en-IN")} branch records`}
            </p>
          </div>
        </div>

        <div className="branch-filters">
          <div className="branch-search">
            <Search size={17} />
            <input
              type="text"
              placeholder="Search branch, code, city or manager..."
              value={search}
              onChange={(event) => handleSearch(event.target.value)}
            />
          </div>

          <select
            value={selectedState}
            onChange={(event) => handleStateChange(event.target.value)}
          >
            <option value="">All States</option>
            {analytics.states.map((state) => (
              <option value={state} key={state}>
                {state}
              </option>
            ))}
          </select>

          <button className="branch-reset-btn" onClick={resetFilters}>
            Reset
          </button>
        </div>

        <div className="branch-table-wrapper">
          <table className="branch-table">
            <thead>
              <tr>
                <th>Branch Name</th>
                <th>Branch Code</th>
                <th>City</th>
                <th>State</th>
                <th>IFSC Code</th>
                <th>Branch Manager</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="branch-table-message">
                    Loading branch records...
                  </td>
                </tr>
              ) : branches.length === 0 ? (
                <tr>
                  <td colSpan={6} className="branch-table-message">
                    No branch records found.
                  </td>
                </tr>
              ) : (
                branches.map((branch) => (
                  <tr key={branch.branch_id}>
                    <td className="branch-name-cell">
                      <div className="branch-name-icon">
                        <Landmark size={16} />
                      </div>
                      <span>{branch.branch_name}</span>
                    </td>
                    <td>{branch.branch_code || "—"}</td>
                    <td>{branch.city || "—"}</td>
                    <td>{branch.state || "—"}</td>
                    <td className="branch-ifsc-cell">
                      {branch.ifsc_code || "—"}
                    </td>
                    <td>{branch.manager_name || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="branch-pagination">
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
              onClick={() => setCurrentPage((page) => page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <p className="branch-data-note">
        Branch information and geographic statistics are based on the project's
        synthetic dataset and are for demonstration purposes only.
      </p>
    </div>
  );
}

export default Branches;
