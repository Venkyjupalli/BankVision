
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

interface DepositData {
  branch_id: number;
  branch: string;
  investment: string | number;
}

export default function DepositAnalyticsChart() {
  const [depositData, setDepositData] = useState<
    { branch: string; investment: number }[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDepositData = async () => {
      try {
        const response = await axios.get<DepositData[]>(
          "http://localhost:5000/api/dashboard/deposits"
        );

        setDepositData(
          response.data.map((item) => ({
            branch: item.branch.replace(" Main Branch", ""),
            investment: Number(item.investment),
          }))
        );
      } catch (err) {
        console.error("Deposit analytics error:", err);
        setError("Unable to load deposit analytics.");
      } finally {
        setLoading(false);
      }
    };

    fetchDepositData();
  }, []);

  if (loading) {
    return <div className="chart-card">Loading deposit analytics...</div>;
  }

  if (error) {
    return <div className="chart-card">{error}</div>;
  }

  return (
    <div className="chart-card branch-chart-card">
      <div className="chart-header">
        <h3>Fixed Deposit Investment by Branch</h3>
        <p>Total FD investment (₹ Crores)</p>
      </div>

      <div className="branch-chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={depositData}
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
                "FD Investment",
              ]}
            />

            <Bar
              dataKey="investment"
              fill="#0891b2"
              radius={[5, 5, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
