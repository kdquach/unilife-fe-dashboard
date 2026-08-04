import React from "react";
import { Card } from "antd";
import {
  AppstoreOutlined,
  CheckCircleOutlined,
  StopOutlined,
  CoffeeOutlined,
} from "@ant-design/icons";
import { COLORS } from "../orders/utils/orderUtils.jsx";

export default function FoodSummaryCards({ stats }) {
  return (
    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4">
      <Card
        className="dashboard-card"
        styles={{ body: { padding: "16px 18px" } }}
        style={{
          borderRadius: 14,
          borderTop: `3px solid ${COLORS.orange}`,
          boxShadow: "0 2px 10px rgba(20, 20, 43, 0.05)",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-500">Foods</div>
            <div className="mt-1 text-2xl font-bold" style={{ color: COLORS.orange }}>
              {stats.total}
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
              background: `${COLORS.orange}1a`,
              color: COLORS.orange,
              fontSize: 18,
            }}
          >
            <AppstoreOutlined />
          </div>
        </div>
      </Card>

      <Card
        className="dashboard-card"
        styles={{ body: { padding: "16px 18px" } }}
        style={{
          borderRadius: 14,
          borderTop: `3px solid ${COLORS.green}`,
          boxShadow: "0 2px 10px rgba(20, 20, 43, 0.05)",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-500">Active on Page</div>
            <div className="mt-1 text-2xl font-bold" style={{ color: COLORS.green }}>
              {stats.active}
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
              background: `${COLORS.green}1a`,
              color: COLORS.green,
              fontSize: 18,
            }}
          >
            <CheckCircleOutlined />
          </div>
        </div>
      </Card>

      <Card
        className="dashboard-card"
        styles={{ body: { padding: "16px 18px" } }}
        style={{
          borderRadius: 14,
          borderTop: `3px solid ${COLORS.red}`,
          boxShadow: "0 2px 10px rgba(20, 20, 43, 0.05)",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-500">Inactive on Page</div>
            <div className="mt-1 text-2xl font-bold" style={{ color: COLORS.red }}>
              {stats.inactive}
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
              background: `${COLORS.red}1a`,
              color: COLORS.red,
              fontSize: 18,
            }}
          >
            <StopOutlined />
          </div>
        </div>
      </Card>

      <Card
        className="dashboard-card"
        styles={{ body: { padding: "16px 18px" } }}
        style={{
          borderRadius: 14,
          borderTop: `3px solid ${COLORS.purple}`,
          boxShadow: "0 2px 10px rgba(20, 20, 43, 0.05)",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-500">Menu Items on Page</div>
            <div className="mt-1 text-2xl font-bold" style={{ color: COLORS.purple }}>
              {stats.menuItems}
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
              background: `${COLORS.purple}1a`,
              color: COLORS.purple,
              fontSize: 18,
            }}
          >
            <CoffeeOutlined />
          </div>
        </div>
      </Card>
    </div>
  );
}
