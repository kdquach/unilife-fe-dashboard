import React from "react";
import { Table, Tag, Button, Space } from "antd";
import { EyeOutlined, QrcodeOutlined } from "@ant-design/icons";
import { formatDateTime } from "../../../utils/format";

const formatVnd = (value) => `${Number(value || 0).toLocaleString("vi-VN")} đ`;

const renderOrderStatus = (status) => {
  const colors = {
    PENDING_PAYMENT: "orange",
    PENDING: "orange",
    PAID: "green",
    CONFIRMED: "blue",
    PREPARING: "purple",
    READY: "cyan",
    READY_FOR_PICKUP: "cyan",
    COMPLETED: "green",
    CANCELLED: "red",
    EXPIRED: "red",
  };

  return <Tag color={colors[status] || "default"}>{status}</Tag>;
};

const renderPaymentStatus = (status) => {
  const colors = {
    PENDING: "orange",
    PAID: "green",
    FAILED: "red",
    REFUND_PENDING: "gold",
    REFUNDED: "blue",
  };

  return <Tag color={colors[status] || "default"}>{status}</Tag>;
};

const canScanPickup = (order) =>
  order?.paymentStatus === "PAID" &&
  ["PAID", "CONFIRMED"].includes(order?.status) &&
  !order?.queue;

export default function OrderTable({
  orders,
  loading,
  pagination,
  onViewDetail,
  onScanPickup,
  scanning,
  onChange,
}) {
  const columns = [
    {
      title: "Order Code",
      dataIndex: "orderCode",
    },
    {
      title: "Customer",
      dataIndex: "userId",
      render: (user) => user?.fullName || <Tag color="blue">Walk-in</Tag>,
    },
    {
      title: "Queue",
      dataIndex: "queue",
      render: (queue) => queue?.queueNumber,
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
              "Unknown",
          )
          .join(", "),
    },
    {
      title: "Total",
      dataIndex: "totalPrice",
      render: (value) => formatVnd(value),
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
      width: 160,
      render: (value) => formatDateTime(value),
    },
    {
      title: "Actions",
      fixed: "right",
      width: 130,
      render: (_, record) => (
        <Space size={6}>
          <Button
            icon={<EyeOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onViewDetail(record);
            }}
          />
        </Space>
      ),
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
      onChange={onChange}
    />
  );
}
