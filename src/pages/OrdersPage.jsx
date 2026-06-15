import React, { useEffect, useState } from "react";
import { Card, Table, Tag } from "antd";
import { orderService } from "../features/orders/orderService";
import { Modal, Descriptions } from "antd";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

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
     <>
    <Card title="Orders">
      <Table
        rowKey="_id"
        loading={loading}
        columns={columns}
        dataSource={orders}
        onRow={(record) => ({
            onClick: () => {
            setSelectedOrder(record);
            setDetailOpen(true);
            },
        })}
        />
    </Card>

    <Modal
        title={`Order ${selectedOrder?.orderCode}`}
        open={detailOpen}
        footer={null}
        onCancel={() => setDetailOpen(false)}
        width={900}
      >
        {selectedOrder && (
          <>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Order Code">
                {selectedOrder.orderCode}
              </Descriptions.Item>

              <Descriptions.Item label="Customer">
                {selectedOrder.userId?.fullName || "Walk-in"}
              </Descriptions.Item>

              <Descriptions.Item label="Status">
                {selectedOrder.status}
              </Descriptions.Item>

              <Descriptions.Item label="Payment Status">
                {selectedOrder.paymentStatus}
              </Descriptions.Item>

              <Descriptions.Item label="Payment Method">
                {selectedOrder.paymentMethod}
              </Descriptions.Item>

              <Descriptions.Item label="Total Price">
                {selectedOrder.totalPrice?.toLocaleString("vi-VN")} đ
              </Descriptions.Item>
            </Descriptions>

            <Table
              style={{ marginTop: 20 }}
              pagination={false}
              rowKey="_id"
              dataSource={selectedOrder.items || []}
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
                  title: "Unit Price",
                  dataIndex: "unitPrice",
                  render: (value) =>
                    Number(value).toLocaleString("vi-VN") + " đ",
                },
                {
                  title: "Subtotal",
                  dataIndex: "subtotal",
                  render: (value) =>
                    Number(value).toLocaleString("vi-VN") + " đ",
                },
              ]}
            />
          </>
        )}
      </Modal>
    </>
  );
}
