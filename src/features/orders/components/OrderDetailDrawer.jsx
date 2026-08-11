import React, { useState, useEffect, useRef } from "react";
import { Drawer, Descriptions, Table, Tag, Button, Space, Popconfirm } from "antd";
import { orderService } from "../orderService";
import { notify } from "../../../utils/notify";
import { DEFAULT_SEPAY_CONFIG } from "../../../constants/payment";

function extractPaymentErrors(note) {
  if (!note) return { cleanNote: "", errors: [] };

  // Split by pipe '|' or '. Error:'
  const parts = note.split(/\s*\|\s*/);
  
  const cleanParts = [];
  const errors = [];

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    const lower = trimmed.toLowerCase();
    if (
      lower.startsWith("error:") ||
      lower.includes("order not confirmed") ||
      lower.includes("order not found") ||
      lower.includes("not found") ||
      lower.includes("invalid payment amount") ||
      lower.includes("invalid transfer content") ||
      lower.includes("transfer content") ||
      lower.includes("incorrect transfer content") ||
      lower.includes("content mismatch") ||
      lower.includes("mismatch") ||
      lower.includes("incorrect") ||
      lower.includes("invalid") ||
      lower.includes("failed") ||
      lower.includes("rejected")
    ) {
      let errText = trimmed.replace(/^(?:error|message):\s*/i, "").trim();
      errText = errText.replace(/\.?\s*order not confirmed\.?$/i, "").trim();
      if (errText) {
        errors.push(errText);
      }
    } else {
      cleanParts.push(trimmed);
    }
  }

  // Fallback if no pipe separator was used
  if (errors.length === 0 && (
    note.toLowerCase().includes("error:") ||
    note.toLowerCase().includes("order not confirmed") ||
    note.toLowerCase().includes("not found")
  )) {
    const errorRegex = /(?:Error|Message):\s*(.*?)(?=\.\s*Order not confirmed|\||$)/gi;
    const matches = [...note.matchAll(errorRegex)];
    if (matches.length > 0) {
      const fullErrorRegex = /(?:Error|Message):\s*.*?(?=\.\s*Order not confirmed|\||$)(?:\.\s*Order not confirmed\.?)?/gi;
      let cleanNote = note.replace(fullErrorRegex, "").replace(/[\s|.,;]+$/, "").trim();
      const extractedErrors = matches.map(m => m[1].replace(/\.?\s*order not confirmed\.?$/i, "").trim()).filter(Boolean);
      return { cleanNote, errors: extractedErrors };
    } else {
      return { cleanNote: "", errors: [note.trim()] };
    }
  }

  return {
    cleanNote: cleanParts.join(", ").trim(),
    errors,
  };
}

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

export default function OrderDetailDrawer({ order: initialOrder, open, onClose, onSuccess }) {
  const [order, setOrder] = useState(initialOrder);
  const [updating, setUpdating] = useState(false);
  const [liveTimeLeft, setLiveTimeLeft] = useState(0);
  const autoCancelledOrderIdRef = useRef(null);
  const openRef = useRef(open);
  openRef.current = open;

  useEffect(() => {
    if (open) {
      setOrder(initialOrder);
    } else {
      setLiveTimeLeft(0);
      setUpdating(false);
    }
  }, [initialOrder, open]);

  const isCancelled = order?.status === "CANCELLED";
  const isPending = !isCancelled && (order?.status === "PENDING_PAYMENT" || order?.status === "PENDING" || order?.paymentStatus === "PENDING");
  const isCash = order?.paymentMethod === "CASH";
  const isSePay = order?.paymentMethod === "SEPAY" || order?.paymentMethod === "BANK_TRANSFER";

  // Polling for live updates when drawer is open
  useEffect(() => {
    let intervalId;
    if (open && order && order._id && isPending && isSePay) {
      let isFetching = false;
      intervalId = window.setInterval(async () => {
        if (isFetching) return;
        isFetching = true;
        try {
          const freshOrder = await orderService.getOrderById(order._id);
          if (freshOrder) {
            setOrder(freshOrder);
            const isPaidOrConfirmed =
              freshOrder.paymentStatus === "PAID" ||
              freshOrder.status === "PAID" ||
              freshOrder.status === "CONFIRMED" ||
              freshOrder.status === "COMPLETED";

            if (isPaidOrConfirmed) {
              if (intervalId) window.clearInterval(intervalId);
              const isWalkInOrder = freshOrder.isWalkIn === true || freshOrder.isWalkIn === "true";
              if (isWalkInOrder && freshOrder.status !== "COMPLETED") {
                orderService.updateOrder(freshOrder._id, { status: "COMPLETED" }).catch((updateErr) => {
                  console.error("Failed to update walk-in order status to COMPLETED", updateErr);
                });
              }
              notify.success("Payment confirmed!");
              onSuccess?.();
            }
          }
        } catch (err) {
          console.warn("Polling error in OrderDetailDrawer:", err);
        } finally {
          isFetching = false;
        }
      }, 3000);
    }

    return () => {
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [open, order?._id, order?.status, order?.paymentMethod, onSuccess]);

  useEffect(() => {
    let timer;
    if (open && order && isPending && isSePay) {
      const calculateTimeLeft = () => {
        const createdTime = order.createdAt ? new Date(order.createdAt).getTime() : Date.now();
        const expiresAt = createdTime + 15 * 60000;
        const now = Date.now();
        const distance = expiresAt - now;
        return Math.max(0, Math.floor(distance / 1000));
      };
      
      setLiveTimeLeft(calculateTimeLeft());
      
      timer = window.setInterval(() => {
        setLiveTimeLeft(calculateTimeLeft());
      }, 1000);
    }
    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, [open, order?.createdAt, isPending, isSePay]);

  useEffect(() => {
    if (!open || !order?._id || isCancelled || !isPending || !isSePay) return;
    if (autoCancelledOrderIdRef.current === order._id) return;

    const createdTime = order.createdAt ? new Date(order.createdAt).getTime() : null;
    if (!createdTime) return;

    const expiresAt = createdTime + 15 * 60000;
    if (Date.now() < expiresAt) return;

    autoCancelledOrderIdRef.current = order._id;
    const orderId = order._id;
    let isStale = false;

    const autoCancelExpiredOrder = async () => {
      try {
        setUpdating(true);
        await orderService.updateOrder(orderId, { status: "CANCELLED", paymentStatus: "FAILED" });
        if (isStale || !openRef.current) return;
        setOrder((prev) => ({ ...prev, status: "CANCELLED", paymentStatus: "FAILED" }));
        notify.info("Order Cancelled", "Order automatically cancelled due to QR code expiration.");
        onSuccess?.();
      } catch (err) {
        if (isStale || !openRef.current) return;

        const errMsg = String(err?.response?.data?.message || err?.message || "").toLowerCase();
        const statusCode = err?.response?.status;
        const alreadyCancelled =
          statusCode === 400 ||
          statusCode === 409 ||
          errMsg.includes("cancelled") ||
          errMsg.includes("cancel") ||
          errMsg.includes("already") ||
          errMsg.includes("invalid status");

        if (alreadyCancelled) {
          setOrder((prev) => ({ ...prev, status: "CANCELLED", paymentStatus: "FAILED" }));
          onSuccess?.();
          return;
        }

        notify.error("Cancel Failed", "Failed to auto-cancel expired order.");
      } finally {
        if (!isStale && openRef.current) {
          setUpdating(false);
        }
      }
    };

    autoCancelExpiredOrder();

    return () => {
      isStale = true;
    };
  }, [liveTimeLeft, open, order?._id, order?.createdAt, isCancelled, isPending, isSePay, onSuccess]);

  if (!order) return null;

  const handleCancelOrder = async () => {
    try {
      setUpdating(true);
      await orderService.updateOrder(order._id, { status: "CANCELLED", paymentStatus: "FAILED" });
      notify.success("Order has been cancelled.");
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      notify.error("Failed to cancel order.");
    } finally {
      setUpdating(false);
    }
  };

  const handleMarkAsPaid = async () => {
    try {
      setUpdating(true);
      const isWalkInOrder = order.isWalkIn === true || order.isWalkIn === "true";
      const targetStatus = isWalkInOrder ? "COMPLETED" : "PAID";
      await orderService.updateOrder(order._id, { status: targetStatus, paymentStatus: "PAID" });
      setOrder((prev) => ({ ...prev, status: targetStatus, paymentStatus: "PAID" }));
      notify.success(`Order marked as ${targetStatus}.`);
      onSuccess?.();
      onClose();
    } catch (err) {
      notify.error("Failed to mark order as paid.");
    } finally {
      setUpdating(false);
    }
  };

  const minutes = Math.floor(liveTimeLeft / 60);
  const seconds = liveTimeLeft % 60;
  const canCancel = isPending && order?.status !== "CANCELLED" && order?.status !== "EXPIRED" && order?.paymentStatus !== "FAILED";

  // Render SePay Pending Area
  const renderSePayPending = () => {
    if (!isPending || !isSePay || order?.status === "CANCELLED" || order?.status === "EXPIRED") return null;

    const { errors } = extractPaymentErrors(order.note);
    const hasPaymentError = errors.length > 0 || (order.note && (
      order.note.toLowerCase().includes("error") ||
      order.note.toLowerCase().includes("order not confirmed") ||
      order.note.toLowerCase().includes("mismatch") ||
      order.note.toLowerCase().includes("invalid") ||
      order.note.toLowerCase().includes("content") ||
      order.note.toLowerCase().includes("amount")
    ));

    const bank = order.paymentInfo?.bankName || DEFAULT_SEPAY_CONFIG.BANK_NAME;
    const acc = order.paymentInfo?.accountNumber || DEFAULT_SEPAY_CONFIG.ACCOUNT_NUMBER;
    const accountName = order.paymentInfo?.accountName || DEFAULT_SEPAY_CONFIG.ACCOUNT_NAME;
    const amount = order.totalPrice;
    const transferContent = order.transferContent || (order.orderCode ? `UN${order.orderCode.replace(/-/g, '')}` : '');

    // Use BE provided qrCodeUrl or fallback
    let qrUrl = order.paymentInfo?.qrCodeUrl;
    if (!qrUrl) {
      qrUrl = `https://qr.sepay.vn/img?acc=${acc}&bank=${bank}&amount=${amount}&des=${transferContent}`;
    }

    return (
      <div className="flex flex-col items-center justify-center p-6 bg-slate-50 border rounded-lg mb-6 shadow-sm">
        <div className="text-lg font-bold mb-2">Awaiting SePay Transfer</div>
        
        <div className="mb-4">
          <Tag color={liveTimeLeft > 0 ? "orange" : "red"} style={{ margin: 0, padding: '4px 12px', fontSize: 14 }}>
            Expires in: {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </Tag>
        </div>

        {liveTimeLeft === 0 ? (
          <div className="flex flex-col items-center justify-center bg-red-50 p-6 rounded-lg text-center border border-red-200 w-full max-w-sm">
            <span className="text-red-500 font-bold mb-2">QR Code Expired</span>
            <span className="text-sm text-slate-600">Cancelling order automatically...</span>
          </div>
        ) : (
          <>
            {hasPaymentError ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm w-full max-w-md text-center">
                <div className="font-bold text-red-700 mb-1.5 flex items-center justify-center gap-1.5">
                  <span>⚠️ PAYMENT ERROR DETECTED</span>
                </div>
                <div className="text-xs text-red-600 mb-2">
                  {errors.length > 0 ? (
                    <div className="flex flex-col gap-1.5 text-left bg-white/90 p-2.5 rounded border border-red-100 my-1">
                      {errors.map((err, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 font-medium text-red-800">
                          <span>• {err}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span>The system rejected the previous payment attempt due to invalid payment details or transfer content.</span>
                  )}
                </div>
                <div className="text-xs text-slate-600">
                  Please scan the QR code below or use manual transfer with the <b>exact amount and transfer content</b>.
                </div>
              </div>
            ) : (
              <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded mb-4 text-sm w-full max-w-sm text-center">
                <strong>⚠️ IMPORTANT WARNING:</strong><br />
                Do <b>NOT</b> modify the transfer amount or content. Incorrect details will cause the system to reject the payment.
              </div>
            )}

            <img 
              src={qrUrl} 
              alt="SePay QR Code" 
              style={{ width: 250, border: '1px solid #e2e8f0', borderRadius: 8, marginBottom: 16 }}
            />
            
            <div className="flex flex-col bg-white p-4 rounded-lg w-full max-w-sm border shadow-sm">
              <div className="text-sm mb-3 font-bold text-slate-700 text-center uppercase tracking-wider border-b pb-2">Manual Transfer Info</div>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between items-center border-b pb-1.5">
                  <span className="text-slate-500 font-medium">Bank</span>
                  <span className="font-bold text-slate-800">{bank}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-1.5">
                  <span className="text-slate-500 font-medium">Account Number</span>
                  <span className="font-bold text-slate-800 font-mono select-all">{acc}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-1.5">
                  <span className="text-slate-500 font-medium">Account Name</span>
                  <span className="font-bold text-slate-800 uppercase">{accountName}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-1.5">
                  <span className="text-slate-500 font-medium">Amount</span>
                  <span className="font-bold text-blue-600">{formatVnd(amount)}</span>
                </div>
                <div className="flex justify-between items-center pt-0.5">
                  <span className="text-slate-500 font-medium">Transfer Content</span>
                  <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200 font-mono select-all">{transferContent}</span>
                </div>
              </div>
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
            {canCancel && (
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
          {order.isWalkIn === true || order.isWalkIn === "true" ? "Walk-in" : "Online"}
        </Descriptions.Item>

        <Descriptions.Item label="Total Price">
          {formatVnd(order.totalPrice)}
        </Descriptions.Item>

        <Descriptions.Item label="Transaction Ref">
          {order.transactionRef || "-"}
        </Descriptions.Item>

        <Descriptions.Item label="Created At">
          {new Date(order.createdAt).toLocaleString("en-US")}
        </Descriptions.Item>

        <Descriptions.Item label="Updated At">
          {new Date(order.updatedAt).toLocaleString("en-US")}
        </Descriptions.Item>

        <Descriptions.Item label="Note" span={2}>
          {(() => {
            if (!order.note) return "-";
            
            const { cleanNote, errors } = extractPaymentErrors(order.note);
            
            if (errors.length > 0) {
              return (
                <div className="flex flex-col gap-1.5 w-full">
                  {cleanNote && (
                    <div className="text-slate-800 font-medium">
                      <span className="text-slate-500">Customer Note: </span>
                      {cleanNote}
                    </div>
                  )}

                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-red-600">
                      Payment Error Log ({errors.length} attempt{errors.length > 1 ? "s" : ""}):
                    </span>
                    <ul className="list-disc list-inside text-xs text-red-600 space-y-0.5 pl-1">
                      {errors.map((errContent, index) => (
                        <li key={index} className="font-medium">
                          {errContent}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            }
            
            return order.note;
          })()}
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
