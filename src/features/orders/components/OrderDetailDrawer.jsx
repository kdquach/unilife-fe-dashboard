import React, { useState } from "react";
import { Drawer, Descriptions, Table, Tag, Button, Space, Popconfirm, message } from "antd";
import { orderService } from "../orderService";

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

export default function OrderDetailDrawer({ order, open, onClose, onSuccess }) {
  const [updating, setUpdating] = useState(false);
  const [liveTimeLeft, setLiveTimeLeft] = useState(0);

  const isPending = order?.status === "PENDING_PAYMENT" || order?.status === "PENDING";
  const isCash = order?.paymentMethod === "CASH";
  const isSePay = order?.paymentMethod === "SEPAY";

  React.useEffect(() => {
    let timer;
    if (order && isPending && isSePay) {
      const calculateTimeLeft = () => {
        const expiresAt = new Date(order.createdAt).getTime() + 15 * 60000;
        const now = new Date().getTime();
        const distance = expiresAt - now;
        return Math.max(0, Math.floor(distance / 1000));
      };
      
      setLiveTimeLeft(calculateTimeLeft());
      
      timer = setInterval(() => {
        setLiveTimeLeft(calculateTimeLeft());
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    }
  }, [order, isPending, isSePay]);

  if (!order) return null;

  const handleCancelOrder = async () => {
    try {
      setUpdating(true);
      await orderService.updateOrder(order._id, { status: "CANCELLED", paymentStatus: "FAILED" });
      message.success("Order has been cancelled.");
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      message.error("Failed to cancel order.");
    } finally {
      setUpdating(false);
    }
  };

  const handleMarkAsPaid = async () => {
    try {
      setUpdating(true);
      await orderService.updateOrder(order._id, { status: "PAID", paymentStatus: "PAID" });
      
      message.success("Order marked as PAID.");
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      message.error("Failed to mark order as paid.");
    } finally {
      setUpdating(false);
    }
  };

  const minutes = Math.floor(liveTimeLeft / 60);
  const seconds = liveTimeLeft % 60;

  // Render SePay Pending Area
  const renderSePayPending = () => {
    const isPaymentFailed = order.paymentStatus === "FAILED" || order.paymentStatus === "ERROR" || order.status === "FAILED" || (order.note && order.note.includes("Error: Invalid payment amount"));
    if (isPaymentFailed && isSePay) {
      return (
        <div className="flex flex-col items-center justify-center bg-red-50 p-6 rounded-lg text-center mb-6 border border-red-200">
          <span className="text-red-600 font-bold mb-2 text-lg">Payment Failed (Amount Mismatch)</span>
          <span className="text-sm text-slate-600">
            The automated system rejected this payment due to an amount mismatch or invalid content. 
            This order must be reconciled manually at the end of the day.
          </span>
        </div>
      );
    }
    
    if (!isPending || !isSePay) return null;
    
    // Use BE provided qrCodeUrl or fallback
    let qrUrl = order.paymentInfo?.qrCodeUrl;
    if (!qrUrl) {
      const bank = order.paymentInfo?.bankName || "MB";
      const acc = order.paymentInfo?.accountNumber || "0988776655";
      const amount = order.totalPrice;
      const des = order.transferContent || (order.orderCode ? `UN${order.orderCode.replace(/-/g, '')}` : '');
      qrUrl = `https://qr.sepay.vn/img?acc=${acc}&bank=${bank}&amount=${amount}&des=${des}`;
    }

    const transferContent = order.transferContent || (order.orderCode ? `UN${order.orderCode.replace(/-/g, '')}` : '');

    return (
      <div className="flex flex-col items-center justify-center p-6 bg-slate-50 border rounded-lg mb-6 shadow-sm">
        <div className="text-lg font-bold mb-2">Awaiting SePay Transfer</div>
        
        <div className="mb-4">
          <Tag color={liveTimeLeft > 0 ? "orange" : "red"} style={{ margin: 0, padding: '4px 12px', fontSize: 14 }}>
            Expires in: {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </Tag>
        </div>

        {liveTimeLeft === 0 ? (
          <div className="flex flex-col items-center justify-center bg-red-50 p-6 rounded-lg text-center border border-red-200">
            <span className="text-red-500 font-bold mb-2">QR Code Expired</span>
            <span className="text-sm text-slate-600">The 15-minute payment window has closed. Please cancel this order.</span>
          </div>
        ) : (
          <>
            <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded mb-4 text-sm w-full max-w-sm text-center">
              <strong>⚠️ IMPORTANT WARNING:</strong><br />
              Do <b>NOT</b> modify the transfer amount or content. Incorrect details will cause the system to reject the payment, and you will have to wait for the end-of-day revenue reconciliation to resolve it.
            </div>
            <img 
              src={qrUrl} 
              alt="SePay QR Code" 
              style={{ width: 250, border: '1px solid #e2e8f0', borderRadius: 8, marginBottom: 16 }}
            />
            <div className="flex flex-col items-center justify-center bg-white p-4 rounded text-center w-full max-w-sm border">
              <span className="text-xs text-slate-500 mb-1">Transfer Content (Important)</span>
              <span className="text-lg font-bold text-slate-800">{transferContent}</span>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <Drawer
      title={`Order ${order.orderCode}`}
      placement="right"
      width={900}
      open={open}
      onClose={onClose}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Space>
            {isPending && (
              <Popconfirm
                title="Cancel Order"
                description="Are you sure you want to cancel this order?"
                onConfirm={handleCancelOrder}
                okText="Yes"
                cancelText="No"
              >
                <Button danger loading={updating}>Cancel Order</Button>
              </Popconfirm>
            )}
            
            {isPending && isCash && (
              <Popconfirm
                title="Confirm Payment"
                description="Has the customer paid in cash?"
                onConfirm={handleMarkAsPaid}
                okText="Yes"
                cancelText="No"
              >
                <Button type="primary" style={{ backgroundColor: '#52c41a' }} loading={updating}>Mark as PAID</Button>
              </Popconfirm>
            )}
            <Button onClick={onClose}>Close</Button>
          </Space>
        </div>
      }
    >
      {renderSePayPending()}

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
            render: (_, item) => {
              const p = item.unitPrice || item.price || item.foodId?.price || item.menuScheduleItemId?.foodId?.price || 0;
              return formatVnd(p);
            }
          },
          {
            title: "Subtotal",
            render: (_, item) => {
              const p = item.unitPrice || item.price || item.foodId?.price || item.menuScheduleItemId?.foodId?.price || 0;
              return formatVnd(p * item.quantity);
            }
          },
        ]}
        summary={() => {
          return (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={3}>
                  <strong>Total</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  <strong>{formatVnd(order.totalPrice)}</strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          );
        }}
      />
    </Drawer>
  );
}
