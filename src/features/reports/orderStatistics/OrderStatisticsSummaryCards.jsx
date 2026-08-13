import React from "react";
import { Card } from "antd";
import {
  ShoppingCartOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { COLORS } from "../../orders/utils/orderUtils.jsx";

export default function OrderStatisticsSummaryCards({
  summary,
}) {
  if (!summary) return null;

  const cards = [
    {
      title: "Total Orders",
      value: summary.totalOrders,
      icon: <ShoppingCartOutlined />,
      color: COLORS.blue,
      borderColor: COLORS.blue,
    },
    {
      title: "Pending",
      value: summary.pending,
      icon: <ClockCircleOutlined />,
      color: COLORS.orange,
      borderColor: COLORS.orange,
    },
    {
      title: "Preparing",
      value: summary.preparing,
      icon: <ToolOutlined />,
      color: COLORS.purple,
      borderColor: COLORS.purple,
    },
    {
      title: "Completed",
      value: summary.completed,
      icon: <CheckCircleOutlined />,
      color: COLORS.green,
      borderColor: COLORS.green,
    },
    {
      title: "Cancelled",
      value: summary.cancelled,
      icon: <CloseCircleOutlined />,
      color: COLORS.red,
      borderColor: COLORS.red,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5 mb-5">
      {cards.map((item) => (
        <Card
          key={item.title}
          className="dashboard-card"
          styles={{ body: { padding: "16px 18px" } }}
          style={{
            borderRadius: 14,
            borderTop: `3px solid ${item.borderColor}`,
            boxShadow: "0 2px 10px rgba(20, 20, 43, 0.05)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">{item.title}</div>
              <div className="mt-1 text-2xl font-bold" style={{ color: item.color }}>
                {item.value}
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
                background: `${item.color}1a`,
                color: item.color,
                fontSize: 18,
              }}
            >
              {item.icon}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
