import React from "react";
import { Table, Tag } from "antd";

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
  onRowClick,
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
  ];

  return (
    <Table
      style={{ marginTop: 24 }}
      rowKey="status"
      loading={loading}
      columns={columns}
      dataSource={data}
      pagination={false}
      onRow={(record) => ({
        onClick: () => {
          if (onRowClick) {
            onRowClick(record);
          }
        },
        style: {
          cursor: "pointer",
        },
      })}
    />
  );
}