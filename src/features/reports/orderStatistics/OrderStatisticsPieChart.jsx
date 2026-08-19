import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const STATUS_COLORS = {
  Cancelled: "#ff4d4f",      // Đỏ
  Completed: "#52c41a",      // Xanh lá
  Preparing: "#722ed1",     // Tím
  Confirmed: "#1677ff",     // Xanh dương
  Pending: "#faad14",        // Vàng
  Delivered: "#13c2c2",     // Xanh cyan
  Default: "#eb2f96",        // Mặc định hồng
};

export default function OrderStatisticsPieChart({
  data = [],
  onSliceClick,
}) {
  const chartData = data.map((item) => ({
    ...item,
    name: item.status,
    value: item.orders,
  }));

  const getColorForStatus = (status) => {
    // Case-insensitive matching
    const normalizedStatus = status?.toLowerCase();
    const statusLowerMap = {
      cancelled: "#ff4d4f",         // Đỏ
      completed: "#52c41a",         // Xanh lá
      preparing: "#722ed1",        // Tím
      confirmed: "#1677ff",         // Xanh dương
      pending: "#faad14",           // Vàng
      pending_payment: "#fa8c16",  // Cam đậm
      expired: "#d9d9d9",          // Xám
      paid: "#13c2c2",             // Xanh cyan
      refund_pending: "#eb2f96",    // Hồng
    };
    
    return statusLowerMap[normalizedStatus] || "#8c8c8c";
  };

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
          {chartData.map((entry, index) => (
            <Cell
              key={index}
              fill={getColorForStatus(entry.status)}
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
