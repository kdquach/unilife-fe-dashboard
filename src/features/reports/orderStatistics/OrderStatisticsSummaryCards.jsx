import React from "react";
import { Card } from "antd";
import {
  ShoppingCartOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ToolOutlined,
} from "@ant-design/icons";

export default function OrderStatisticsSummaryCards({
  summary,
}) {
  if (!summary) return null;

  const cards = [
    {
      title: "Total Orders",
      value: summary.totalOrders,
      icon: <ShoppingCartOutlined />,
      color: "#2563eb",
    },
    {
      title: "Pending",
      value: summary.pending,
      icon: <ClockCircleOutlined />,
      color: "#f59e0b",
    },
    {
      title: "Preparing",
      value: summary.preparing,
      icon: <ToolOutlined />,
      color: "#7c3aed",
    },
    {
      title: "Completed",
      value: summary.completed,
      icon: <CheckCircleOutlined />,
      color: "#16a34a",
    },
    {
      title: "Cancelled",
      value: summary.cancelled,
      icon: <CloseCircleOutlined />,
      color: "#dc2626",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5 mb-5">
      {cards.map((item) => (
        <Card
          key={item.title}
          className="dashboard-card"
        >
          <div className="flex items-center gap-4">
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background: "#f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: item.color,
                fontSize: 24,
              }}
            >
              {item.icon}
            </div>

            <div>
              <div className="text-slate-500 text-sm">
                {item.title}
              </div>

              <div className="text-2xl font-bold">
                {item.value}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}