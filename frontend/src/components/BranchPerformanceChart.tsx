
import { useEffect, useState } from "react";
import axios from "axios";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface BranchData {
  branch: string;
  balance: string | number;
}

export default function BranchPerformanceChart() {
  const [branchData, setBranchData] = useState<
    { branch: string; balance: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBranchData = async () => {
      try {
        const response = await axios.get<BranchData[]>(
          "http://localhost:5000/api/dashboard/branches"
        );

        setBranchData(
          response.data.map((item) => ({
            branch: item.branch.replace(" Main Branch", ""),
            balance: Number(item.balance),
          }))
        );
      } catch (err) {
        console.error("Branch analytics error:", err);
        setError("Unable to load branch analytics.");
      } finally {
        setLoading(false);
      }
    };

    fetchBranchData();
  }, []);

  if (loading) {
    return <div className="chart-card">Loading branch analytics...</div>;
  }

  if (error) {
    return <div className="chart-card">{error}</div>;
  }

  return (
    <div className="chart-card branch-chart-card">
      <div className="chart-header">
        <h3>Branch Performance</h3>
        <p>Total account balance by branch (₹ Crores)</p>
      </div>

      <div className="branch-chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={branchData}
            margin={{ top: 15, right: 20, left: 5, bottom: 70 }}
          >
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="branch"
              angle={-35}
              textAnchor="end"
              interval={0}
              tick={{ fontSize: 10 }}
            />

            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(value) => `₹${value}`}
            />

            <Tooltip
              formatter={(value) => [
                `₹${value} Cr`,
                "Account Balance",
              ]}
            />

            <Bar
              dataKey="balance"
              fill="#2563eb"
              radius={[5, 5, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
