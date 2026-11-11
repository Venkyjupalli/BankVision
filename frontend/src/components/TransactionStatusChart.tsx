
import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../services/config";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface TransactionStatus {
  name: string;
  value: number;
}

const STATUS_COLORS: Record<string, string> = {
  Success: "#16a34a",
  Failed: "#dc2626",
  Pending: "#f59e0b",
};

export default function TransactionStatusChart() {
  const [transactionData, setTransactionData] =
    useState<TransactionStatus[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTransactionData = async () => {
      try {
        const response = await axios.get<TransactionStatus[]>(
          `${API_URL}/transactions`
        );

        setTransactionData(response.data);
      } catch (err) {
        console.error("Transaction analytics error:", err);
        setError("Unable to load transaction analytics.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionData();
  }, []);

  if (loading) {
    return <div className="chart-card">Loading transaction analytics...</div>;
  }

  if (error) {
    return <div className="chart-card">{error}</div>;
  }

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3>Transaction Status</h3>
        <p>Distribution of transaction outcomes</p>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={transactionData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={100}
              paddingAngle={4}
            >
              {transactionData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={STATUS_COLORS[entry.name] || "#64748b"}
                />
              ))}
            </Pie>

            <Tooltip />
            <Legend verticalAlign="bottom" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
