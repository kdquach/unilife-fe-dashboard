import React from "react";
import { Card } from "antd";
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  Line,
} from "recharts";

export default function RevenueTrendChart({ data }) {
  const chartData =
    data?.map((item) => ({
      date: item._id,
      revenue: item.revenue,
      orders: item.orders,
    })) || [];

  return (
    <Card
      className="dashboard-card mb-5"
      title="Revenue Trend"
    >
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="4 4" />

          <XAxis dataKey="date" />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#1677ff"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}