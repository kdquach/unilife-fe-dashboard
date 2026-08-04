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

const formatMoney = (value = 0) =>
  new Intl.NumberFormat("vi-VN").format(value) + " ₫";

const CustomTooltip = ({
  active,
  payload,
  label,
}) => {
  if (!active || !payload?.length) return null;

  const item = payload[0].payload;

  return (
    <div className="rounded-lg border bg-white p-3 shadow-lg">
      <div className="mb-2 font-semibold">
        📅 {label}
      </div>

      <div>
        Revenue:{" "}
        <strong>{formatMoney(item.revenue)}</strong>
      </div>

      <div>
        Orders: <strong>{item.orders}</strong>
      </div>
    </div>
  );
};

export default function RevenueTrendChart({
  data,
}) {
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
      <ResponsiveContainer
        width="100%"
        height={350}
      >
        <LineChart
          data={chartData}
          margin={{
            top: 20,
            right: 20,
            left: 10,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="date"
            tick={{
              fontSize: 12,
            }}
          />

          <YAxis
            tickFormatter={(value) =>
              new Intl.NumberFormat("vi-VN").format(
                value
              )
            }
          />

          <Tooltip
            content={<CustomTooltip />}
          />

          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#1677ff"
            strokeWidth={3}
            dot={{
              r: 5,
              fill: "#1677ff",
            }}
            activeDot={{
              r: 8,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
