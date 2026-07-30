import React from "react";
import { Card } from "antd";
import { ShopOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { COLORS } from "../utils/orderUtils.jsx";

/**
 * Summary cards showing order statistics
 */
export default function OrderSummaryCards({ orders }) {
  const statCards = [
    {
      label: "Orders On Page",
      value: orders.length,
      color: COLORS.orange,
      icon: <ShopOutlined />,
    },
    {
      label: "Completed",
      value: orders.filter((o) => o.status === "COMPLETED").length,
      color: COLORS.green,
      icon: <CheckCircleOutlined />,
    },
    {
      label: "Pending",
      value: orders.filter((o) => o.status === "PENDING").length,
      color: COLORS.blue,
      icon: <ClockCircleOutlined />,
    },
    {
      label: "Cancelled",
      value: orders.filter((o) => o.status === "CANCELLED").length,
      color: COLORS.red,
      icon: <CloseCircleOutlined />,
    },
  ];

  return (
    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4">
      {statCards.map((stat) => (
        <Card
          key={stat.label}
          className="dashboard-card"
          styles={{ body: { padding: "16px 18px" } }}
          style={{
            borderRadius: 14,
            borderTop: `3px solid ${stat.color}`,
            boxShadow: "0 2px 10px rgba(20, 20, 43, 0.05)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">{stat.label}</div>
              <div className="mt-1 text-2xl font-bold" style={{ color: stat.color }}>
                {stat.value}
              </div>
            </div>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `${stat.color}1a`,
                color: stat.color,
                fontSize: 18,
              }}
            >
              {stat.icon}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
