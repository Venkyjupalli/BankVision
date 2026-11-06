
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

interface LoanData {
  branch_id: number;
  branch: string;
  outstanding: string | number;
}

export default function LoanAnalyticsChart() {
  const [loanData, setLoanData] = useState<
    { branch: string; outstanding: number }[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLoanData = async () => {
      try {
        const response = await axios.get<LoanData[]>(
          "http://localhost:5000/api/dashboard/loans"
        );

        setLoanData(
          response.data.map((item) => ({
            branch: item.branch.replace(" Main Branch", ""),
            outstanding: Number(item.outstanding),
          }))
        );
      } catch (err) {
        console.error("Loan analytics error:", err);
        setError("Unable to load loan analytics.");
      } finally {
        setLoading(false);
      }
    };

    fetchLoanData();
  }, []);

  if (loading) {
    return <div className="chart-card">Loading loan analytics...</div>;
  }

  if (error) {
    return <div className="chart-card">{error}</div>;
  }

  return (
    <div className="chart-card branch-chart-card">
      <div className="chart-header">
        <h3>Outstanding Loans by Branch</h3>
        <p>Loan outstanding amount (₹ Crores)</p>
      </div>

      <div className="branch-chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={loanData}
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
                "Outstanding Loan",
              ]}
            />

            <Bar
              dataKey="outstanding"
              fill="#9333ea"
              radius={[5, 5, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
