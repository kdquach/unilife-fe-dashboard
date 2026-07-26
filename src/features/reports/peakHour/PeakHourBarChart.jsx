import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LabelList,
} from "recharts";

const formatMoney = (value = 0) =>
  new Intl.NumberFormat("vi-VN").format(value) + " ₫";

export default function PeakHourTrendChart({ data = [], onBarClick }) {
  const chartData = data
    .map((item) => ({
      ...item,
      hourLabel: `${String(item.hour).padStart(2, "0")}:00`,
    }))
    .sort((a, b) => a.hour - b.hour);

  return (
    <ResponsiveContainer width="100%" height={380}>
      <BarChart
        data={chartData}
        margin={{
          top: 20,
          right: 20,
          left: 0,
          bottom: 20,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis dataKey="hourLabel" />

        <YAxis />

        <Tooltip
          formatter={(value, name, props) => [
            `${props.payload.orders} orders`,
            "Orders",
          ]}
          labelFormatter={(label, payload) => {
            if (!payload?.length) return label;

            return [
              `🕐 ${label}`,
              `Revenue: ${formatMoney(payload[0].payload.revenue)}`,
            ];
          }}
        />

        <Bar
          dataKey="orders"
          radius={[8, 8, 0, 0]}
          onClick={(data) => onBarClick?.(data)}
        >
          <LabelList dataKey="orders" position="top" />

          {chartData.map((_, index) => (
            <Cell key={index} fill="#1677ff" />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
