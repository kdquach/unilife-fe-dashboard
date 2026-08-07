import React, { useState, useMemo, useEffect, useRef } from "react";
import { Modal, Input, Button, Space, Tag, Empty, Badge, Image, Form, Select, Spin } from "antd";
import { notify } from "../../../utils/notify";
import { getImageUrl, imageNotFound } from "../../../utils/image";
import { PlusOutlined, MinusOutlined, DeleteOutlined, SearchOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import menuScheduleApi from "../../menuSchedules/api/menuScheduleApi";
import { orderService } from "../orderService";
import { foodService } from "../../foods/foodService";

const { confirm } = Modal;

const formatVnd = (value) => `${Number(value || 0).toLocaleString("vi-VN")} đ`;

function normalizeTodayMenuItems(todayMenu) {
  if (!todayMenu) return [];

  const rawItems = todayMenu.items || [];

  return rawItems
    .filter((item) => item.isActive !== false && item.foodId)
    .map((item) => {
      const food = item.foodId || {};
      const menuScheduleItemId = item.menuScheduleItemId || item._id;

      return {
        key: menuScheduleItemId,
        foodId: food._id,
        menuScheduleItemId,
        name: food.name || "Unknown",
        price: food.price ?? 0,
        imageUrl: getImageUrl(food.imageUrl),
        categoryName:
          (typeof food.categoryId === "object" && food.categoryId?.name) ||
          null,
        stockQuantity: item.remainingCount,
        isMenuItem: !!food.isMenuItem,
        isDailyFood: false,
      };
    })
    .filter((f) => f.key && f.stockQuantity > 0);
}

function normalizeDailyFoods(dailyFoods) {
  if (!dailyFoods || !Array.isArray(dailyFoods)) return [];

  return dailyFoods
    .filter((food) => food.isActive !== false)
    .map((food) => ({
      key: `daily_${food._id}`,
      foodId: food._id,
      menuScheduleItemId: null,
      name: food.name || "Unknown",
      price: food.price ?? 0,
      imageUrl: getImageUrl(food.imageUrl),
      categoryName:
        (typeof food.categoryId === "object" && food.categoryId?.name) ||
        null,
      stockQuantity: food.stockQuantity ?? 999,
      isMenuItem: false,
      isDailyFood: true,
    }));
}

function extractPaymentErrors(note) {
  if (!note) return { cleanNote: "", errors: [] };

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

export default function WalkInOrderModal({ open, onClose, onSuccess }) {
  const [foods, setFoods] = useState([]);
  const [foodsLoading, setFoodsLoading] = useState(false);
  const [foodSearch, setFoodSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [note, setNote] = useState("");
  const [creating, setCreating] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [polling, setPolling] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [paymentWarning, setPaymentWarning] = useState(false);
  const [paymentWarningData, setPaymentWarningData] = useState(null);
  const [successCountdown, setSuccessCountdown] = useState(10);
  const [timeLeft, setTimeLeft] = useState(0);
  const [orderCancelled, setOrderCancelled] = useState(false);
  const initialNoteRef = useRef("");
  const autoCancelRef = useRef(false);
  const openRef = useRef(open);
  openRef.current = open;

  const fetchTodayMenuFoods = async () => {
    try {
      setFoodsLoading(true);

      // Fetch both menu schedule foods and daily foods
      const [menuScheduleResponse, dailyFoodsResponse] = await Promise.allSettled([
        menuScheduleApi.getTodayMenuSchedule(),
        foodService.getDailyFoods(),
      ]);

      // Process menu schedule foods
      const todayMenu = menuScheduleResponse.status === 'fulfilled' 
        ? (menuScheduleResponse.value?.data ?? menuScheduleResponse.value) 
        : null;
      const menuFoods = normalizeTodayMenuItems(todayMenu);

      // Process daily foods
      const dailyFoods = dailyFoodsResponse.status === 'fulfilled'
        ? (dailyFoodsResponse.value?.data?.items ?? dailyFoodsResponse.value?.items ?? [])
        : [];
      const normalizedDailyFoods = normalizeDailyFoods(dailyFoods);

      // Merge both food lists, prioritizing menu schedule items
      const mergedFoods = [...menuFoods];
      
      // Add daily foods that aren't already in the menu
      const menuFoodIds = new Set(menuFoods.map(f => f.foodId));
      normalizedDailyFoods.forEach(dailyFood => {
        if (!menuFoodIds.has(dailyFood.foodId)) {
          mergedFoods.push(dailyFood);
        }
      });

      setFoods(mergedFoods);
    } catch (error) {
      console.error(error);
      notify.error(
  "Failed to Load Today's Menu",
  error?.response?.data?.message ||
    "Unable to load today's menu for walk-in orders.",
);
      setFoods([]);
    } finally {
      setFoodsLoading(false);
    }
  };

  // Pre-load data when component mounts
  React.useEffect(() => {
    if (open) {
      handleOpen();
    }
  }, [open]);

  const handleOpen = () => {
    setCart([]);
    setPaymentMethod("CASH");
    setNote("");
    setFoodSearch("");
    setCreatedOrder(null);
    setPolling(false);
    setPaymentSuccess(false);
    setPaymentFailed(false);
    setPaymentWarning(false);
    setPaymentWarningData(null);
    setSuccessCountdown(10);
    setTimeLeft(0);
    setOrderCancelled(false);
    autoCancelRef.current = false;
    fetchTodayMenuFoods();
  };

  const cartQuantityOf = (key) =>
    cart.find((item) => item.key === key)?.quantity || 0;

  const addToCart = (food) => {
    const alreadyInCart = cartQuantityOf(food.key);

    if (alreadyInCart >= food.stockQuantity) {
      notify.warning(
  "Limit Reached",
  `Only ${food.stockQuantity} servings of "${food.name}" are available today.`,
);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.key === food.key);

      if (existing) {
        return prev.map((item) =>
          item.key === food.key
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...prev, { ...food, quantity: 1 }];
    });
  };

  const updateCartQuantity = (key, quantity) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.key !== key) return item;

        const clamped = Math.max(
          1,
          Math.min(Number(quantity) || 1, item.stockQuantity),
        );

        return { ...item, quantity: clamped };
      }),
    );
  };

  const removeFromCart = (key) => {
    setCart((prev) => prev.filter((item) => item.key !== key));
  };

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  );

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  );

  const filteredFoods = useMemo(() => {
    const q = foodSearch.trim().toLowerCase();
    if (!q) return foods;
    return foods.filter((food) => food.name.toLowerCase().includes(q));
  }, [foods, foodSearch]);

  const handleCreateWalkIn = async () => {
    if (creating) return;

    if (cart.length === 0) {
      notify.warning(
  "Cart is Empty",
  "Please select at least one item before creating an order.",
);
      return;
    }

    if (cart.some(item => item.quantity < 1)) {
      notify.error("Invalid Quantity", "Quantity must be at least 1.");
      return;
    }

    try {
      setCreating(true);

      const payload = {
        paymentMethod,
        isWalkIn: true,
        items: cart.map((item) => {
          if (item.menuScheduleItemId) {
            // Menu schedule item: send menuScheduleItemId and MENU_ITEM type
            return {
              menuScheduleItemId: item.menuScheduleItemId,
              itemType: "MENU_ITEM",
              quantity: item.quantity,
            };
          } else {
            // Regular food: send foodId and REGULAR_FOOD type
            return {
              foodId: item.foodId || item._id,
              itemType: "REGULAR_FOOD",
              quantity: item.quantity,
            };
          }
        }),
      };

      if (note.trim()) {
        payload.note = note.trim();
      }

      const response = await orderService.createWalkInOrder(payload);
      const newOrder = response?.data || response;

      notify.success(
        "Walk-in Order Created",
        "Order has been created successfully.",
      );

      if (paymentMethod === "SEPAY" || paymentMethod === "BANK_TRANSFER") {
        initialNoteRef.current = newOrder?.note || "";
        setCreatedOrder(newOrder);
        setPolling(true);
      } else {
        // For CASH payments, automatically set status to COMPLETED for walk-in orders
        const orderId = newOrder._id || newOrder.id;
        try {
          await orderService.updateOrder(orderId, { status: "COMPLETED" });
        } catch (updateErr) {
          console.error("Failed to update walk-in order status to COMPLETED", updateErr);
        }
        onClose();
        onSuccess();
      }
    } catch (error) {
      console.error(error);

      notify.error(
        "Order Creation Failed",
        error?.response?.data?.message || "Unexpected error occurred.",
      );
    } finally {
      setCreating(false);
    }
  };

  const handleCancelExpiredOrder = async (isAuto = false) => {
    if (!createdOrder || autoCancelRef.current) return;
    autoCancelRef.current = true;
    const orderId = createdOrder._id || createdOrder.id;
    try {
      setCreating(true);
      await orderService.updateOrder(orderId, { status: "CANCELLED", paymentStatus: "FAILED" });
      if (!openRef.current && isAuto) return;
      setCreatedOrder((prev) => ({ ...prev, status: "CANCELLED", paymentStatus: "FAILED" }));
      setPolling(false);
      setOrderCancelled(true);
      if (openRef.current) {
        notify.success(
          "Order Cancelled",
          isAuto
            ? "The order was automatically cancelled due to QR code expiration."
            : "The expired order has been cancelled.",
        );
      }
      onSuccess();
      if (!isAuto) {
        onClose();
      }
    } catch (err) {
      console.error(err);
      if (!openRef.current && isAuto) return;

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
        if (openRef.current) {
          setCreatedOrder((prev) => ({ ...prev, status: "CANCELLED", paymentStatus: "FAILED" }));
          setPolling(false);
          setOrderCancelled(true);
          onSuccess();
        }
        return;
      }

      if (openRef.current) {
        notify.error("Cancel Failed", "Failed to cancel the order.");
      }
    } finally {
      if (openRef.current) {
        setCreating(false);
      }
    }
  };

  useEffect(() => {
    let intervalId;
    const targetId = createdOrder?._id || createdOrder?.id;

    if (polling && targetId) {
      intervalId = setInterval(async () => {
        try {
          let order;
          try {
            const res = await orderService.getOrderById(targetId);
            order = res?.data || res;
          } catch (e) {
            const res = await orderService.getOrders({ keyword: createdOrder?.orderCode, limit: 20 });
            order = res.data?.find(o => (o._id === targetId || o.id === targetId));
            if (!order) {
               const res2 = await orderService.getOrders({ limit: 20 });
               order = res2.data?.find(o => (o._id === targetId || o.id === targetId));
            }
          }

          if (order) {
            setCreatedOrder(order);

            if (order.paymentStatus === "PAID" || order.status === "PAID" || order.status === "COMPLETED" || order.status === "CONFIRMED") {
              setPolling(false);
              clearInterval(intervalId);

              if (order.isWalkIn && order.status !== "COMPLETED") {
                try {
                  await orderService.updateOrder(order._id || order.id, { status: "COMPLETED" });
                } catch (updateErr) {
                  console.error("Failed to update walk-in order status to COMPLETED", updateErr);
                }
              }

              setPaymentSuccess(true);
              onSuccess();
            } else if (
              order.paymentStatus === "FAILED" || 
              order.paymentStatus === "ERROR" || 
              order.status === "FAILED"
            ) {
              setPolling(false);
              clearInterval(intervalId);
              setPaymentFailed(true);
            }
          }
        } catch (err) {
          console.error("Polling error", err);
        }
      }, 3000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [polling, createdOrder?._id, createdOrder?.id, onSuccess]);

  useEffect(() => {
    let timer;
    if (paymentSuccess && successCountdown > 0) {
      timer = setInterval(() => {
        setSuccessCountdown(prev => prev - 1);
      }, 1000);
    } else if (paymentSuccess && successCountdown === 0) {
      onClose();
    }
    return () => {
      if (timer) timer && clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentSuccess, successCountdown]);

  useEffect(() => {
    let timer;
    if (open && createdOrder) {
      const createdTime = createdOrder.createdAt ? new Date(createdOrder.createdAt).getTime() : Date.now();
      const expiresAt = createdTime + 15 * 60000;
      
      const updateCountdown = () => {
        const now = Date.now();
        const distance = expiresAt - now;
        if (distance <= 0) {
          setTimeLeft(0);
        } else {
          setTimeLeft(Math.floor(distance / 1000));
        }
      };

      updateCountdown();
      timer = setInterval(updateCountdown, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [open, createdOrder?.createdAt]);

  useEffect(() => {
    if (
      !open ||
      !createdOrder ||
      createdOrder.status === "CANCELLED" ||
      paymentSuccess ||
      paymentFailed ||
      orderCancelled
    ) {
      return;
    }

    const createdTime = createdOrder.createdAt ? new Date(createdOrder.createdAt).getTime() : null;
    if (!createdTime) return;

    const expiresAt = createdTime + 15 * 60000;
    if (Date.now() < expiresAt) return;

    handleCancelExpiredOrder(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, timeLeft, createdOrder, paymentSuccess, paymentFailed, orderCancelled]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (polling && createdOrder && !paymentSuccess) {
        e.preventDefault();
        e.returnValue = ''; // Required for Chrome to show the warning dialog
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [polling, createdOrder, paymentSuccess]);

  const handleClosePayment = () => {
    if (paymentSuccess) {
      onClose();
      return;
    }

    confirm({
      title: 'Confirm Close',
      content: 'The order is pending payment. If closed, you can still reopen the QR code in Order Details.',
      okText: 'Close Popup',
      cancelText: 'Continue Payment',
      onOk() {
        onClose();
        onSuccess();
      },
    });
  };

  // If order is created and pending payment (SePay), show QR screen
  if (createdOrder) {
    let qrUrl = createdOrder.paymentInfo?.qrCodeUrl;
    const bank = createdOrder.paymentInfo?.bankName || "MB";
    const acc = createdOrder.paymentInfo?.accountNumber || "0988776655";
    const amount = createdOrder.totalPrice;
    const getTransferContent = (ord) => {
      if (!ord) return "";
      if (ord.transferContent) return ord.transferContent;
      if (ord.paymentInfo?.transferContent) return ord.paymentInfo.transferContent;
      if (ord.orderCode) {
        const cleanCode = String(ord.orderCode).replace(/-/g, "");
        return cleanCode.toUpperCase().startsWith("UN") ? cleanCode : `UN${cleanCode}`;
      }
      return "";
    };
    const transferContent = getTransferContent(createdOrder);
    
    // Fallback if backend doesn't provide qrCodeUrl
    if (!qrUrl) {
      qrUrl = `https://qr.sepay.vn/img?acc=${acc}&bank=${bank}&amount=${amount}&des=${transferContent}`;
    }

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
      <Modal
        title="Waiting for Payment"
        open={open}
        width={400}
        onCancel={handleClosePayment}
        footer={(paymentSuccess || paymentFailed || orderCancelled) ? [
          <Button key="close" onClick={onClose}>
            Close
          </Button>
        ] : [
          <Button key="close" onClick={handleClosePayment}>
            Close
          </Button>
        ]}
        destroyOnHidden
      >
        <div className="flex flex-col items-center py-6">
          <div className="text-lg font-bold mb-2">Total: {formatVnd(createdOrder.totalPrice)}</div>
          <div className="text-sm text-slate-500 mb-4">Order Code: {createdOrder.orderCode}</div>
          
          {!paymentSuccess && !orderCancelled && (
            <div className="mb-4">
              <Tag color={timeLeft > 0 ? "orange" : "red"} style={{ margin: 0, padding: '4px 12px', fontSize: 14 }}>
                Expires in: {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </Tag>
            </div>
          )}

          {createdOrder.status === "CANCELLED" || createdOrder.status === "EXPIRED" ? (
            <div className="flex flex-col items-center justify-center bg-red-50 p-6 rounded-lg text-center mb-4 border border-red-200 w-full">
              <CloseCircleOutlined style={{ fontSize: 48, color: '#ff4d4f', marginBottom: 12 }} />
              <span className="text-red-600 font-bold mb-2 text-lg">Order Cancelled</span>
              <span className="text-sm text-slate-600 mb-4">This order has been cancelled. QR code is no longer active.</span>
              <Button danger onClick={onClose} type="primary">
                Close
              </Button>
            </div>
          ) : timeLeft === 0 && !paymentSuccess && !paymentFailed && !orderCancelled ? (
            <div className="flex flex-col items-center justify-center bg-red-50 p-6 rounded-lg text-center mb-4 border border-red-200">
              <span className="text-red-500 font-bold mb-2">QR Code Expired</span>
              <span className="text-sm text-slate-600">Cancelling order automatically...</span>
            </div>
          ) : paymentFailed ? (
            <div className="flex flex-col items-center justify-center bg-red-50 p-6 rounded-lg text-center mb-4 border border-red-200">
              <CloseCircleOutlined style={{ fontSize: 48, color: '#ff4d4f', marginBottom: 12 }} />
              <span className="text-red-600 font-bold mb-2 text-lg">Payment Failed</span>
              <span className="text-sm text-slate-600 mb-4">
                The automated system cannot confirm this order. 
                Please wait for the end-of-day revenue reconciliation to resolve this issue or contact the canteen staff.
              </span>
              <Button danger onClick={onClose} type="primary">
                Close Now
              </Button>
            </div>
          ) : paymentSuccess ? (
            <div className="flex flex-col items-center justify-center bg-green-50 p-6 rounded-lg text-center mb-4 border border-green-200">
              <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 12 }} />
              <span className="text-green-600 font-bold mb-2 text-lg">Payment Successful!</span>
              <span className="text-sm text-slate-600 mb-4">Order has been confirmed. This window will close automatically in {successCountdown} seconds.</span>
              <Button type="primary" onClick={onClose} style={{ backgroundColor: '#52c41a' }}>
                Close Now
              </Button>
            </div>
          ) : (
            <>
              {(() => {
                const { errors: paymentErrors } = extractPaymentErrors(createdOrder?.note);
                const hasPaymentError = paymentErrors.length > 0 || (createdOrder?.note && (
                  createdOrder?.note.toLowerCase().includes("error") ||
                  createdOrder?.note.toLowerCase().includes("order not confirmed") ||
                  createdOrder?.note.toLowerCase().includes("mismatch") ||
                  createdOrder?.note.toLowerCase().includes("invalid") ||
                  createdOrder?.note.toLowerCase().includes("content") ||
                  createdOrder?.note.toLowerCase().includes("amount")
                )) || createdOrder?.paymentStatus === "REFUND_PENDING";

                if (hasPaymentError) {
                  return (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm w-full max-w-md text-center">
                      <div className="font-bold text-red-700 mb-1.5 flex items-center justify-center gap-1.5">
                        <span>⚠️ PAYMENT ERROR DETECTED</span>
                      </div>
                      <div className="text-xs text-red-600 mb-2">
                        {paymentErrors.length > 0 ? (
                          <div className="flex flex-col gap-1.5 text-left bg-white/90 p-2.5 rounded border border-red-100 my-1">
                            {paymentErrors.map((err, idx) => (
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
                  );
                }

                return (
                  <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded mb-4 text-sm w-full text-center">
                    <strong>⚠️ IMPORTANT WARNING:</strong><br />
                    Do <b>NOT</b> modify the transfer amount or content. Incorrect details will cause the system to reject the payment.
                  </div>
                );
              })()}
              
              <Image 
                src={qrUrl} 
                fallback={imageNotFound}
                alt="SePay QR Code" 
                width={250} 
                preview={false} 
                className="border rounded shadow-sm mb-4"
              />
              
              <div className="flex flex-col bg-slate-50 p-4 rounded w-full mt-2 border">
                <div className="text-sm mb-3 font-bold text-slate-700 text-center uppercase tracking-wider">Manual Transfer Info</div>
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex justify-between items-center border-b pb-1">
                    <span className="text-slate-500">Bank</span>
                    <span className="font-bold text-slate-800">{bank}</span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-1">
                    <span className="text-slate-500">Account</span>
                    <span className="font-bold text-slate-800">{acc}</span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-1">
                    <span className="text-slate-500">Amount</span>
                    <span className="font-bold text-blue-600">{formatVnd(amount)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-slate-500">Content</span>
                    <span className="font-bold text-red-600 bg-white px-2 py-0.5 rounded border">{transferContent}</span>
                  </div>
                </div>
              </div>
            </>
          )}
          
          {timeLeft > 0 && !paymentSuccess && !paymentFailed && (
            <div className="flex items-center gap-2 mt-6 text-blue-600">
              <Spin size="small" />
              <span className="text-sm font-medium">Waiting for payment...</span>
            </div>
          )}
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title="Create Walk-in Order"
      open={open}
      width={960}
      onCancel={onClose}
      onOk={handleCreateWalkIn}
      confirmLoading={creating}
      destroyOnHidden
    >
      <div className="flex flex-col gap-4 md:flex-row">
        {/* Food picker */}
        <div className="md:w-3/5">
          <Input
            allowClear
            prefix={<SearchOutlined className="text-slate-400" />}
            placeholder="Search today's menu..."
            value={foodSearch}
            onChange={(e) => setFoodSearch(e.target.value)}
            className="mb-3"
          />

          <div
            className="grid grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3"
            style={{ maxHeight: "58vh" }}
          >
            {foodsLoading && (
              <div className="col-span-full py-10 flex items-center justify-center">
                <Spin size="large" />
              </div>
            )}

            {!foodsLoading && filteredFoods.length === 0 && (
              <div className="col-span-full py-10">
                <Empty description="No food items available in today's menu" />
              </div>
            )}

            {!foodsLoading &&
              filteredFoods.map((food) => {
                const inCartQty = cartQuantityOf(food.key);
                const remaining = food.stockQuantity - inCartQty;
                const soldOut = remaining <= 0;
                const isDailyFood = food.isDailyFood;

                return (
                  <div
                    key={food.key}
                    onClick={() => !soldOut && addToCart(food)}
                    className={`group relative flex flex-col overflow-hidden rounded-lg border transition ${
                      soldOut
                        ? "cursor-not-allowed border-slate-100 opacity-60"
                        : "cursor-pointer border-slate-200 hover:border-blue-400 hover:shadow-md"
                    }`}
                  >
                    <div className="relative h-24 w-full bg-slate-100">
                      <Image
                        src={food.imageUrl}
                        fallback={imageNotFound}
                        alt={food.name}
                        width="100%"
                        height={96}
                        className="object-cover"
                        style={{ objectFit: "cover" }}
                        preview={false}
                      />

                      {isDailyFood && (
                        <div className="absolute top-2 left-2 rounded bg-green-500 px-2 py-0.5 text-xs font-medium text-white">
                          Available
                        </div>
                      )}

                      {inCartQty > 0 && (
                        <Badge
                          count={inCartQty}
                          style={{
                            position: "absolute",
                            top: 6,
                            right: 6,
                            backgroundColor: "#1677ff",
                          }}
                        />
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-2">
                      <div
                        className="text-sm font-medium text-slate-800"
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={food.name}
                      >
                        {food.name}
                      </div>

                      <div className="text-xs font-semibold text-blue-600">
                        {formatVnd(food.price)}
                      </div>

                      <div className="mt-auto flex items-center justify-between pt-2">
                        <Tag
                          color={soldOut ? "red" : "green"}
                          style={{ margin: 0 }}
                        >
                          {soldOut ? "Sold Out" : `${remaining} Left`}
                        </Tag>

                        <Button
                          size="small"
                          type="primary"
                          shape="circle"
                          icon={<PlusOutlined />}
                          disabled={soldOut}
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(food);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Cart */}
        <div className="md:w-2/5 flex flex-col">
          <div className="mb-3">
            <Select
              value={paymentMethod}
              onChange={setPaymentMethod}
              style={{ width: "100%" }}
              options={[
                { label: "Cash", value: "CASH" },
                { label: "SePay", value: "SEPAY" },
              ]}
            />
          </div>

          <Input.TextArea
            placeholder="Order note..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="mb-3"
          />

          <div
            className="flex-1 overflow-y-auto"
            style={{ maxHeight: "40vh" }}
          >
            {cart.length === 0 ? (
              <div className="flex h-full items-center justify-center text-slate-400">
                Cart is empty
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.key}
                  className="mb-2 flex items-center gap-2 rounded border p-2"
                >
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-sm font-medium truncate"
                      title={item.name}
                    >
                      {item.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {formatVnd(item.price)}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      size="small"
                      icon={<MinusOutlined />}
                      onClick={() => {
                        if (item.quantity === 1) {
                          removeFromCart(item.key);
                        } else {
                          updateCartQuantity(item.key, item.quantity - 1);
                        }
                      }}
                    />

                    <span className="w-8 text-center">{item.quantity}</span>

                    <Button
                      size="small"
                      icon={<PlusOutlined />}
                      disabled={item.quantity >= item.stockQuantity}
                      onClick={() =>
                        updateCartQuantity(item.key, item.quantity + 1)
                      }
                    />
                  </div>

                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeFromCart(item.key)}
                  />
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="mt-3 border-t pt-3">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>{formatVnd(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-500">
                <span>{cartCount} item(s)</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
