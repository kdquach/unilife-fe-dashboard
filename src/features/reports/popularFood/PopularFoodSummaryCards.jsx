import React from "react";
import {
  Card,
} from "antd";
import {
  CoffeeOutlined,
  TrophyOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { COLORS } from "../../orders/utils/orderUtils.jsx";

export default function PopularFoodSummaryCards({
  summary = {},
}) {
  const cards = [
    {
      title: "Total Foods",
      value: summary.totalFoods ?? 0,
      icon: <CoffeeOutlined />,
      color: COLORS.blue,
      borderColor: COLORS.blue,
    },
    {
      title: "Most Popular Food",
      value: summary.mostPopularFood ?? "-",
      icon: <TrophyOutlined />,
      color: COLORS.orange,
      borderColor: COLORS.orange,
    },
    {
      title: "Highest Sold",
      value: summary.highestSold ?? 0,
      suffix: "orders",
      icon: <ShoppingCartOutlined />,
      color: COLORS.green,
      borderColor: COLORS.green,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-5">
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
                {item.suffix && <span className="text-base ml-1">{item.suffix}</span>}
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
