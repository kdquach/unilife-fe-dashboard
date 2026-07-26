import React from "react";
import { Card } from "antd";
import {
  DollarCircleOutlined,
  ShoppingCartOutlined,
  RiseOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

const formatMoney = (value = 0) =>
  new Intl.NumberFormat("vi-VN").format(value) + " ₫";

export default function RevenueSummaryCards({ summary }) {
  if (!summary) return null;

  const cards = [
    {
      title: "Total Revenue",
      value: formatMoney(summary.totalRevenue),
      icon: <DollarCircleOutlined />,
      color: "#16a34a",
    },
    {
      title: "Total Orders",
      value: summary.totalOrders,
      icon: <ShoppingCartOutlined />,
      color: "#2563eb",
    },
    {
      title: "Average Order",
      value: formatMoney(summary.averageOrderValue),
      icon: <RiseOutlined />,
      color: "#d97706",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 mb-5">
      {cards.map((item) => (
        <Card key={item.title} className="dashboard-card">
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