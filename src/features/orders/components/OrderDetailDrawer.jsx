import React from "react";
import { Drawer, Descriptions, Table } from "antd";
import { formatVnd, renderOrderStatus, renderPaymentStatus } from "../utils/orderUtils.jsx";

/**
 * Drawer showing detailed order information
 */
export default function OrderDetailDrawer({ open, onClose, selectedOrder }) {
  return (
    <Drawer
      title={`Order ${selectedOrder?.orderCode}`}
      placement="right"
      width={900}
      open={open}
      onClose={onClose}
    >
      {selectedOrder && (
        <>
          {/* Customer Information */}
          <Descriptions
            bordered
            column={2}
            title="Customer Information"
            style={{ marginBottom: 20 }}
          >
            <Descriptions.Item label="Full Name">
              {selectedOrder.userId?.fullName || "Walk-in"}
            </Descriptions.Item>

            <Descriptions.Item label="User ID">
              {selectedOrder.userId?.userId || "-"}
            </Descriptions.Item>

            <Descriptions.Item label="Email">{selectedOrder.userId?.email || "-"}</Descriptions.Item>

            <Descriptions.Item label="Phone">{selectedOrder.userId?.phone || "-"}</Descriptions.Item>
          </Descriptions>

          {/* Order Information */}
          <Descriptions bordered column={2} title="Order Information" style={{ marginBottom: 20 }}>
            <Descriptions.Item label="Order Code">{selectedOrder.orderCode}</Descriptions.Item>

            <Descriptions.Item label="Order ID">{selectedOrder.orderId}</Descriptions.Item>

            <Descriptions.Item label="Status">
              {renderOrderStatus(selectedOrder.status)}
            </Descriptions.Item>

            <Descriptions.Item label="Payment Status">
              {renderPaymentStatus(selectedOrder.paymentStatus)}
            </Descriptions.Item>

            <Descriptions.Item label="Payment Method">
              {selectedOrder.paymentMethod}
            </Descriptions.Item>

            <Descriptions.Item label="Order Type">
              {selectedOrder.isWalkIn ? "Walk-in" : "Online"}
            </Descriptions.Item>

            <Descriptions.Item label="Total Price">
              <span style={{ fontWeight: 600, color: "#fa8c16" }}>
                {formatVnd(selectedOrder.totalPrice)}
              </span>
            </Descriptions.Item>

            <Descriptions.Item label="Transaction Ref">
              {selectedOrder.transactionRef || "-"}
            </Descriptions.Item>

            <Descriptions.Item label="Created At">
              {new Date(selectedOrder.createdAt).toLocaleString("en-US")}
            </Descriptions.Item>

            <Descriptions.Item label="Updated At">
              {new Date(selectedOrder.updatedAt).toLocaleString("en-US")}
            </Descriptions.Item>

            <Descriptions.Item label="Note" span={2}>
              {selectedOrder.note || "-"}
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
                  item.foodId?.name || item.menuScheduleItemId?.foodId?.name || "Unknown",
              },
              {
                title: "Quantity",
                dataIndex: "quantity",
              },
              {
                title: "Unit Price",
                dataIndex: "unitPrice",
                render: (value) => formatVnd(value),
              },
              {
                title: "Subtotal",
                dataIndex: "subtotal",
                render: (value) => formatVnd(value),
              },
            ]}
          />

          {/* Queue Information */}
          <Descriptions bordered column={2} title="Queue Information" style={{ marginBottom: 20 }}>
            <Descriptions.Item label="Queue Number">
              {selectedOrder.queue?.queueNumber || "-"}
            </Descriptions.Item>

            <Descriptions.Item label="Queue Status">
              {selectedOrder.queue?.status || "-"}
            </Descriptions.Item>

            <Descriptions.Item label="Called At">
              {selectedOrder.queue?.servedAt
                ? new Date(selectedOrder.queue.servedAt).toLocaleString("en-US")
                : "-"}
            </Descriptions.Item>

            <Descriptions.Item label="Completed At">
              {selectedOrder.queue?.doneAt
                ? new Date(selectedOrder.queue.doneAt).toLocaleString("en-US")
                : "-"}
            </Descriptions.Item>
          </Descriptions>
        </>
      )}
    </Drawer>
  );
}
