import React from "react";
import { Card, Col, Row, Statistic } from "antd";
import {
  ClockCircleOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
} from "@ant-design/icons";

const money = (value = 0) =>
  new Intl.NumberFormat("vi-VN").format(value) + " ₫";

export default function PeakHourSummaryCards({ summary = {} }) {
  return (
    <Row gutter={16} className="mb-5">
      <Col xs={24} md={8}>
        <Card className="dashboard-card">
          <Statistic
            title="Peak Hour"
            value={`${summary.peakHour ?? "--"}:00`}
            prefix={<ClockCircleOutlined />}
          />
        </Card>
      </Col>

      <Col xs={24} md={8}>
        <Card className="dashboard-card">
          <Statistic
            title="Highest Orders"
            value={summary.maxOrders || 0}
            suffix="Orders"
            prefix={<ShoppingCartOutlined />}
          />
        </Card>
      </Col>

      <Col xs={24} md={8}>
        <Card className="dashboard-card">
          <Statistic
            title="Revenue at Peak"
            value={money(summary.revenueAtPeakHour)}
            prefix={<DollarOutlined />}
          />
        </Card>
      </Col>
    </Row>
  );
}