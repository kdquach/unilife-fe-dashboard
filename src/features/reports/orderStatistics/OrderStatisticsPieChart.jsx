import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#1677ff",
  "#52c41a",
  "#faad14",
  "#ff4d4f",
  "#722ed1",
  "#13c2c2",
  "#eb2f96",
];

export default function OrderStatisticsPieChart({
  data = [],
  onSliceClick,
}) {
  const chartData = data.map((item) => ({
    ...item,
    name: item.status,
    value: item.orders,
  }));

  return (
    <ResponsiveContainer width="100%" height={420}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          outerRadius={160}
          innerRadius={90}
          labelLine
          label={({ name, percent }) =>
            `${name} ${(percent * 100).toFixed(1)}%`
          }
          onClick={(item) => {
            console.log(item);
            onSliceClick?.(item.payload);
          }}
        >
          {chartData.map((_, index) => (
            <Cell
              key={index}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>

        <Tooltip
          formatter={(value, name, props) => [
            `${props.payload.orders} orders (${props.payload.percentage}%)`,
            props.payload.status,
          ]}
        />

        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
