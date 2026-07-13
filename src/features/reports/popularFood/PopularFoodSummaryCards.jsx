import React from "react";
import {
  Card,
  Col,
  Row,
  Statistic,
} from "antd";
import {
  CoffeeOutlined,
  TrophyOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";

export default function PopularFoodSummaryCards({
  summary = {},
}) {
  return (
    <Row gutter={[16, 16]} className="mb-5">
      <Col xs={24} md={8}>
        <Card className="dashboard-card">
          <Statistic
            title="Total Foods"
            value={summary.totalFoods ?? 0}
            prefix={<CoffeeOutlined />}
          />
        </Card>
      </Col>

      <Col xs={24} md={8}>
        <Card className="dashboard-card">
          <Statistic
            title="Most Popular Food"
            value={summary.mostPopularFood ?? "-"}
            prefix={<TrophyOutlined />}
          />
        </Card>
      </Col>

      <Col xs={24} md={8}>
        <Card className="dashboard-card">
          <Statistic
            title="Highest Sold"
            value={summary.highestSold ?? 0}
            suffix="orders"
            prefix={<ShoppingCartOutlined />}
          />
        </Card>
      </Col>
    </Row>
  );
}