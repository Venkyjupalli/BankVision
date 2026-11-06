
import { useEffect, useState } from "react";
import axios from "axios";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface CustomerSegment {
  name: string;
  value: number;
}

const COLORS = ["#2563eb", "#8b5cf6", "#06b6d4"];

export default function CustomerSegmentChart() {
  const [customerData, setCustomerData] = useState<CustomerSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const response = await axios.get<CustomerSegment[]>(
          "http://localhost:5000/api/dashboard/customers"
        );

        setCustomerData(response.data);
      } catch (err) {
        console.error("Customer analytics error:", err);
        setError("Unable to load customer analytics.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, []);

  if (loading) {
    return <div className="chart-card">Loading customer analytics...</div>;
  }

  if (error) {
    return <div className="chart-card">{error}</div>;
  }

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3>Customer Distribution</h3>
        <p>Customer breakdown by segment</p>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={customerData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={100}
              paddingAngle={4}
            >
              {customerData.map((entry, index) => (
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
    </div>
  );
}
