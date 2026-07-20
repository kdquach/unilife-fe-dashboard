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