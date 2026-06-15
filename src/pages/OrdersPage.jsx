import React, { useEffect, useState } from "react";
import { Card, Table, Tag } from "antd";
import { orderService } from "../features/orders/orderService";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const response = await orderService.getOrders();

      console.log("ORDERS =", response);

      setOrders(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderOrderStatus = (status) => {
  const colors = {
    PENDING: "orange",
    PAID: "blue",
    PREPARING: "purple",
    READY: "cyan",
    COMPLETED: "green",
    CANCELLED: "red",
  };

  return (
    <Tag color={colors[status] || "default"}>
      {status}
    </Tag>
  );
};

const renderPaymentStatus = (status) => {
  const colors = {
    PENDING: "orange",
    PAID: "green",
    FAILED: "red",
    REFUND_PENDING: "gold",
    REFUNDED: "blue",
  };

  return (
    <Tag color={colors[status] || "default"}>
      {status}
    </Tag>
  );
};

// PHẢI đặt ngoài các hàm trên
const columns = [
  {
    title: "Order Code",
    dataIndex: "orderCode",
  },
  {
    title: "Customer",
    dataIndex: "userId",
    render: (user) =>
      user?.fullName || <Tag color="blue">Walk-in</Tag>,
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
            "Unknown"
        )
        .join(", "),
  },
  {
    title: "Total",
    dataIndex: "totalPrice",
    render: (value) =>
      `${Number(value || 0).toLocaleString("vi-VN")} đ`,
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
    <Card title="Orders">
      <Table
        rowKey="_id"
        loading={loading}
        columns={columns}
        dataSource={orders}
      />
    </Card>
  );
}
