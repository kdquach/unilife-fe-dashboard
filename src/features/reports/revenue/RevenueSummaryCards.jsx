import React from "react";
import { Card } from "antd";
import {
  DollarCircleOutlined,
  ShoppingCartOutlined,
  RiseOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { COLORS } from "../../orders/utils/orderUtils.jsx";

const formatMoney = (value = 0) =>
  new Intl.NumberFormat("vi-VN").format(value) + " ₫";

export default function RevenueSummaryCards({ summary }) {
  if (!summary) return null;

  const cards = [
    {
      title: "Total Revenue",
      value: formatMoney(summary.totalRevenue),
      icon: <DollarCircleOutlined />,
      color: COLORS.green,
      borderColor: COLORS.green,
    },
    {
      title: "Total Orders",
      value: summary.totalOrders,
      icon: <ShoppingCartOutlined />,
      color: COLORS.blue,
      borderColor: COLORS.blue,
    },
    {
      title: "Average Order",
      value: formatMoney(summary.averageOrderValue),
      icon: <RiseOutlined />,
      color: COLORS.orange,
      borderColor: COLORS.orange,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 mb-5">
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
