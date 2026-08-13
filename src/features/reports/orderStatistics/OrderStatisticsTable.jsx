import React from "react";
import { Button, Table, Tag } from "antd";
import { EyeOutlined } from "@ant-design/icons";

const STATUS_COLOR = {
  PENDING: "gold",
  PENDING_PAYMENT: "orange",
  PAID: "cyan",
  CONFIRMED: "blue",
  PREPARING: "purple",
  READY: "processing",
  COMPLETED: "success",
  CANCELLED: "error",
};

const STATUS_LABEL = {
  PENDING: "Pending",
  PENDING_PAYMENT: "Pending Payment",
  PAID: "Paid",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  READY: "Ready",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export default function OrderStatisticsTable({
  data = [],
  loading = false,
  onView,
}) {
  const columns = [
    {
      title: "Status",
      dataIndex: "status",
      render: (value) => (
        <Tag color={STATUS_COLOR[value] || "default"}>
          {STATUS_LABEL[value] || value}
        </Tag>
      ),
    },
    {
      title: "Orders",
      dataIndex: "orders",
      align: "center",
    },
    {
      title: "Percentage",
      dataIndex: "percentage",
      align: "center",
      render: (value) => `${value}%`,
    },
    {
      title: "Actions",
      width: 80,
      align: "center",
      render: (_, record) => (
        <Button
          icon={<EyeOutlined />}
          aria-label={`View ${STATUS_LABEL[record.status] || record.status}`}
          title="View details"
          onClick={() => onView?.(record)}
        />
      ),
    },
  ];

  return (
    <Table
      style={{ marginTop: 24 }}
      rowKey="status"
      loading={loading}
      columns={columns}
      dataSource={data}
      pagination={false}
    />
  );
}
