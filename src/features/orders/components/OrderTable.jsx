import React from "react";
import { Table, Tag } from "antd";
import {
  COLORS,
  formatVnd,
  renderOrderStatus,
  renderPaymentStatus,
} from "../utils/orderUtils.jsx";

export default function OrderTable({
  orders,
  loading,
  pagination,
  onViewDetail,
  onPaginationChange,
}) {
  const columns = [
    {
      title: "Order Code",
      dataIndex: "orderCode",
    },
    {
      title: "Customer",
      dataIndex: "userId",
      render: (user) =>
        user?.fullName || (
          <Tag color="orange" style={{ borderRadius: 20 }}>
            Walk-in
          </Tag>
        ),
    },
    {
      title: "Queue",
      dataIndex: "queue",
      render: (queue) => queue?.queueNumber || "-",
    },
    {
      title: "Items",
      dataIndex: "items",
      render: (items = []) =>
        items
          .map(
            (item) =>
              item?.foodId?.name ||
              item?.menuScheduleItemId?.foodId?.name ||
              "Unknown"
          )
          .join(", "),
    },
    {
      title: "Total",
      dataIndex: "totalPrice",
      render: (value) => (
        <span
          style={{
            fontWeight: 600,
            color: COLORS.orange,
          }}
        >
          {formatVnd(value)}
        </span>
      ),
    },
    {
      title: "Order Status",
      dataIndex: "status",
      render: renderOrderStatus,
    },
    {
      title: "Payment",
      dataIndex: "paymentStatus",
      render: renderPaymentStatus,
    },
    {
      title: "Method",
      dataIndex: "paymentMethod",
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      render: (value) =>
        new Date(value).toLocaleString("vi-VN"),
    },
  ];

  return (
    <Table
      rowKey="_id"
      loading={loading}
      columns={columns}
      dataSource={orders}
      pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        showSizeChanger: true,
        showTotal: (total) => `${total} orders`,
      }}
      onChange={(pager) => {
        onPaginationChange?.(pager);
      }}
      onRow={(record) => ({
        onClick: () => onViewDetail?.(record),
        style: {
          cursor: "pointer",
        },
      })}
    />
  );
}