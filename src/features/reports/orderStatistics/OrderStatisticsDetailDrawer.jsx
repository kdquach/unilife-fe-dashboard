import React from "react";
import {
  Drawer,
  Descriptions,
  Progress,
  Tag,
} from "antd";

const statusColor = {
  PENDING: "orange",
  PENDING_PAYMENT: "gold",
  PAID: "cyan",
  CONFIRMED: "blue",
  PREPARING: "processing",
  READY: "purple",
  COMPLETED: "green",
  CANCELLED: "red",
};

export default function OrderStatisticsDetailDrawer({
  open,
  data,
  totalOrders = 0,
  onClose,
}) {
  if (!data) return null;

  return (
    <Drawer
      title="Order Status Detail"
      width={420}
      open={open}
      onClose={onClose}
    >
      <Descriptions
        bordered
        column={1}
        size="middle"
      >
        <Descriptions.Item label="Status">
          <Tag
            color={
              statusColor[data.status] || "default"
            }
          >
            {data.status}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Orders">
          {data.orders}
        </Descriptions.Item>

        {/* <Descriptions.Item label="Percentage">
          {data.percentage.toFixed(2)}%
        </Descriptions.Item> */}

        <Descriptions.Item label="Percentage">
          <Progress
            percent={Number(data.percentage)}
            status="active"
          />
        </Descriptions.Item>

        <Descriptions.Item label="Total Orders">
          {totalOrders}
        </Descriptions.Item>
      </Descriptions>
    </Drawer>
  );
}