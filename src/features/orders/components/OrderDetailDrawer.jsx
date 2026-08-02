import React from "react";
import { Drawer, Descriptions, Table, Tag } from "antd";

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

export default function OrderDetailDrawer({ order, open, onClose }) {
  if (!order) return null;

  return (
    <Drawer
      title={`Order ${order.orderCode}`}
      placement="right"
      width={900}
      open={open}
      onClose={onClose}
    >
      {/* Customer Information */}
      <Descriptions
        bordered
        column={2}
        title="Customer Information"
        style={{ marginBottom: 20 }}
      >
        <Descriptions.Item label="Full Name">
          {order.userId?.fullName || "Walk-in"}
        </Descriptions.Item>

        <Descriptions.Item label="User ID">
          {order.userId?.userId || "-"}
        </Descriptions.Item>

        <Descriptions.Item label="Email">
          {order.userId?.email || "-"}
        </Descriptions.Item>

        <Descriptions.Item label="Phone">
          {order.userId?.phone || "-"}
        </Descriptions.Item>
      </Descriptions>

      {/* Order Information */}
      <Descriptions
        bordered
        column={2}
        title="Order Information"
        style={{ marginBottom: 20 }}
      >
        <Descriptions.Item label="Order Code">
          {order.orderCode}
        </Descriptions.Item>

        <Descriptions.Item label="Order ID">
          {order.orderId}
        </Descriptions.Item>

        <Descriptions.Item label="Status">
          {renderOrderStatus(order.status)}
        </Descriptions.Item>

        <Descriptions.Item label="Payment Status">
          {renderPaymentStatus(order.paymentStatus)}
        </Descriptions.Item>

        <Descriptions.Item label="Payment Method">
          {order.paymentMethod}
        </Descriptions.Item>

        <Descriptions.Item label="Order Type">
          {order.isWalkIn ? "Walk-in" : "Online"}
        </Descriptions.Item>

        <Descriptions.Item label="Total Price">
          {formatVnd(order.totalPrice)}
        </Descriptions.Item>

        <Descriptions.Item label="Transaction Ref">
          {order.transactionRef || "-"}
        </Descriptions.Item>

        <Descriptions.Item label="Created At">
          {new Date(order.createdAt).toLocaleString("vi-VN")}
        </Descriptions.Item>

        <Descriptions.Item label="Updated At">
          {new Date(order.updatedAt).toLocaleString("vi-VN")}
        </Descriptions.Item>

        <Descriptions.Item label="Note" span={2}>
          {order.note || "-"}
        </Descriptions.Item>
      </Descriptions>

      <Table
        style={{ marginTop: 20 }}
        pagination={false}
        rowKey="_id"
        dataSource={order.items || []}
        columns={[
          {
            title: "Food",
            render: (_, item) =>
              item.foodId?.name ||
              item.menuScheduleItemId?.foodId?.name ||
              "Unknown",
          },
          {
            title: "Quantity",
            dataIndex: "quantity",
          },
          {
            title: "Price",
            render: (_, item) => formatVnd(item.price),
          },
          {
            title: "Subtotal",
            render: (_, item) => formatVnd(item.price * item.quantity),
          },
        ]}
        summary={(pageData) => {
          const total = pageData.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );
          return (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={3}>
                  <strong>Total</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  <strong>{formatVnd(total)}</strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          );
        }}
      />
    </Drawer>
  );
}
