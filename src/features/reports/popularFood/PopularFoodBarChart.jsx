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

const COLORS = [
  "#1677ff",
  "#52c41a",
  "#faad14",
  "#ff4d4f",
  "#722ed1",
  "#13c2c2",
  "#eb2f96",
  "#fa8c16",
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;

  const item = payload[0].payload;

  return (
    <div className="rounded-lg border bg-white p-3 shadow-lg">
      <div className="mb-2 font-semibold">🍽 {item.foodName}</div>

      <div>
        Sold: <strong>{item.totalSold}</strong>
      </div>

      <div>
        Revenue: <strong>{formatMoney(item.revenue)}</strong>
      </div>
    </div>
  );
};

export default function PopularFoodBarChart({ data = [] }) {
  const chartData = [...data].sort((a, b) => b.totalSold - a.totalSold);

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
        barCategoryGap="35%"
      >
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis dataKey="foodName" interval={0} />

        <YAxis />

        <Tooltip content={<CustomTooltip />} />

        <Bar
          dataKey="totalSold"
          fill="#1677ff"
          radius={[8, 8, 0, 0]}
          maxBarSize={50}
        >
          <LabelList dataKey="totalSold" position="top" />

          {/* {chartData.map((_, index) => (
            <Cell
              key={index}
              fill={COLORS[index % COLORS.length]}
            />
          ))} */}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
