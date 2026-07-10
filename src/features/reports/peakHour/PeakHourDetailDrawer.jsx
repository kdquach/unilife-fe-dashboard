import React from "react";
import {
  Drawer,
  Descriptions,
  Typography,
  Tag,
  Progress,
  Card,
  Row,
  Col,
} from "antd";
import {
  ClockCircleOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
} from "@ant-design/icons";

const formatMoney = (value = 0) =>
  new Intl.NumberFormat("vi-VN").format(value) + " ₫";

export default function PeakHourDetailDrawer({
  open,
  data,
  maxOrders = 0,
  onClose,
}) {
  if (!data) return null;

  const percent =
    maxOrders === 0
      ? 0
      : Math.round((data.orders / maxOrders) * 100);

  return (
    <Drawer
      title="Peak Hour Detail"
      width={520}
      open={open}
      onClose={onClose}
    >
      <Card
        bordered={false}
        style={{
          marginBottom: 24,
          borderRadius: 16,
          background: "#f6ffed",
        }}
      >
        <Typography.Title
          level={2}
          style={{
            marginBottom: 4,
            textAlign: "center",
          }}
        >
          {data.hour}:00
        </Typography.Title>

        <Typography.Text
          type="secondary"
          style={{
            display: "block",
            textAlign: "center",
          }}
        >
          Peak Hour Information
        </Typography.Text>

        <div
          style={{
            marginTop: 20,
            textAlign: "center",
          }}
        >
          <Tag color="green" style={{ fontSize: 15, padding: "6px 14px" }}>
            {data.orders} Orders
          </Tag>

          <Tag color="blue" style={{ fontSize: 15, padding: "6px 14px" }}>
            {formatMoney(data.revenue)}
          </Tag>
        </div>
      </Card>

      <Descriptions
        bordered
        column={1}
        size="middle"
      >
        <Descriptions.Item
          label={
            <>
              <ClockCircleOutlined /> Hour
            </>
          }
        >
          {data.hour}:00 - {data.hour + 1}:00
        </Descriptions.Item>

        <Descriptions.Item
          label={
            <>
              <ShoppingCartOutlined /> Orders
            </>
          }
        >
          {data.orders}
        </Descriptions.Item>

        <Descriptions.Item
          label={
            <>
              <DollarOutlined /> Revenue
            </>
          }
        >
          {formatMoney(data.revenue)}
        </Descriptions.Item>

        <Descriptions.Item label="Peak Percentage">
          <Progress
            percent={percent}
            status="active"
          />
        </Descriptions.Item>
      </Descriptions>

      <Typography.Title
        level={5}
        style={{
          marginTop: 28,
        }}
      >
        Statistics
      </Typography.Title>

      <Row gutter={16}>
        <Col span={12}>
          <Card>
            <StatisticLike
              title="Orders"
              value={data.orders}
            />
          </Card>
        </Col>

        <Col span={12}>
          <Card>
            <StatisticLike
              title="Revenue"
              value={formatMoney(data.revenue)}
            />
          </Card>
        </Col>
      </Row>

      <Card
        style={{
          marginTop: 20,
          borderRadius: 12,
          background: "#fafafa",
        }}
      >
        <Typography.Paragraph style={{ marginBottom: 0 }}>
          This report represents the business performance during the selected
          hour. Counter Staff and Managers can use this information to identify
          the busiest period of the day and optimize staffing or food
          preparation.
        </Typography.Paragraph>
      </Card>
    </Drawer>
  );
}

function StatisticLike({ title, value }) {
  return (
    <div style={{ textAlign: "center" }}>
      <Typography.Text type="secondary">
        {title}
      </Typography.Text>

      <Typography.Title
        level={3}
        style={{ marginTop: 8, marginBottom: 0 }}
      >
        {value}
      </Typography.Title>
    </div>
  );
}