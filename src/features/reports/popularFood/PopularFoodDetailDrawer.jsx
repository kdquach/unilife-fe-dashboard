import React from "react";
import {
  Drawer,
  Descriptions,
  Progress,
  Tag,
} from "antd";

const formatMoney = (value = 0) =>
  new Intl.NumberFormat("vi-VN").format(value) + " ₫";

export default function PopularFoodDetailDrawer({
  open,
  data,
  totalSold = 0,
  onClose,
}) {
  if (!data) {
    return null;
  }

  const percentage =
    totalSold > 0
      ? Number(((data.totalSold / totalSold) * 100).toFixed(2))
      : 0;

  return (
    <Drawer
      title="Popular Food Detail"
      width={500}
      open={open}
      onClose={onClose}
      destroyOnClose
    >
      <Descriptions
        bordered
        column={1}
        size="middle"
      >
        <Descriptions.Item label="Food Name">
          <Tag color="blue">
            {data.foodName}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Total Sold">
          {data.totalSold}
        </Descriptions.Item>

        <Descriptions.Item label="Revenue">
          {formatMoney(data.revenue)}
        </Descriptions.Item>

        <Descriptions.Item label="Contribution">
          {percentage}%
        </Descriptions.Item>

        <Descriptions.Item label="Progress">
          <Progress
            percent={percentage}
            status="active"
          />
        </Descriptions.Item>
      </Descriptions>
    </Drawer>
  );
}