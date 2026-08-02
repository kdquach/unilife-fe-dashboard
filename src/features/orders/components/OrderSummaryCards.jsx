import React from "react";
import { Card } from "antd";
import { CalendarOutlined,
  CheckCircleOutlined,
  EditOutlined,
  CloseCircleOutlined, } from "@ant-design/icons";
import { COLORS } from "../utils/orderUtils.jsx";

/**
 * Summary cards showing order statistics
 */
export default function OrderSummaryCards({ orders }) {
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
            <div className="text-sm text-slate-500">Orders On Page</div>
            <div className="mt-1 text-2xl font-bold" style={{ color: COLORS.orange }}>
              {orders.length}
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
            <CalendarOutlined />
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
            <div className="text-sm text-slate-500">Completed</div>
            <div className="mt-1 text-2xl font-bold" style={{ color: COLORS.green }}>
              {orders.filter((o) => o.status === "COMPLETED").length}
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
          borderTop: `3px solid ${COLORS.orange}`,
          boxShadow: "0 2px 10px rgba(20, 20, 43, 0.05)",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-500">Pending</div>
            <div className="mt-1 text-2xl font-bold" style={{ color: COLORS.orange }}>
              {orders.filter((o) => o.status === "PENDING").length}
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
            <EditOutlined />
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
            <div className="text-sm text-slate-500">Cancelled</div>
            <div className="mt-1 text-2xl font-bold" style={{ color: COLORS.red }}>
              {orders.filter((o) => o.status === "CANCELLED").length}
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
            <CloseCircleOutlined />
          </div>
        </div>
      </Card>
    </div>
  );
}
