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
      isMenuItem: !!food.isMenuItem,
      isDailyFood: true,
    }));
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
  const initialNoteRef = useRef("");

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
          if (item.isDailyFood) {
            // Daily food: send foodId and REGULAR_FOOD type
            return {
              foodId: item.foodId,
              itemType: "REGULAR_FOOD",
              quantity: item.quantity,
            };
          } else {
            // Menu schedule item: send menuScheduleItemId and MENU_ITEM type
            return {
              menuScheduleItemId: item.menuScheduleItemId,
              itemType: "MENU_ITEM",
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

  const handleCancelExpiredOrder = async () => {
    if (!createdOrder) return;
    try {
      setCreating(true);
      await orderService.updateOrder(createdOrder._id, { status: "CANCELLED", paymentStatus: "FAILED" });
      notify.success("Order Cancelled", "The expired order has been cancelled.");
      onClose();
      onSuccess();
    } catch (err) {
      console.error(err);
      notify.error("Cancel Failed", "Failed to cancel the order.");
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    let intervalId;
    if (polling && createdOrder) {
      intervalId = setInterval(async () => {
        try {
          let order;
          try {
            const res = await orderService.getOrderById(createdOrder._id);
            order = res.data || res;
          } catch (e) {
            // fallback to getOrders if getOrderById 404s
            const res = await orderService.getOrders({ keyword: createdOrder.orderCode, limit: 20 });
            order = res.data?.find(o => o._id === createdOrder._id);
            if (!order) {
               // try without keyword just first page
               const res2 = await orderService.getOrders({ limit: 20 });
               order = res2.data?.find(o => o._id === createdOrder._id);
            }
          }
          
          if (order && (order.paymentStatus === "PAID" || order.status === "PAID" || order.status === "COMPLETED" || order.status === "CONFIRMED")) {
            setPolling(false);
            clearInterval(intervalId);

            if (order.isWalkIn && order.status !== "COMPLETED") {
              try {
                await orderService.updateOrder(order._id, { status: "COMPLETED" });
              } catch (updateErr) {
                console.error("Failed to update walk-in order status to COMPLETED", updateErr);
              }
            }

            setPaymentSuccess(true);
            onSuccess();
          } else if (order && order.note && (
            order.note !== initialNoteRef.current ||
            order.note.includes("Order not confirmed") ||
            order.note.toLowerCase().includes("error") ||
            order.note.toLowerCase().includes("mismatch") ||
            order.note.toLowerCase().includes("invalid") ||
            order.note.toLowerCase().includes("incorrect") ||
            order.note.toLowerCase().includes("content") ||
            order.note.toLowerCase().includes("amount") ||
            order.note.toLowerCase().includes("not found") ||
            order.note.toLowerCase().includes("failed") ||
            order.note.toLowerCase().includes("rejected") ||
            order.note.toLowerCase().includes("transfer")
          )) {
            // Do not clear interval, keep polling! Just set a warning flag.
            setPaymentWarning(true);
            
            const errorRegex = /(?:Error|Message):\s*(.*?)(?=\.\s*Order not confirmed|\||$)/gi;
            const matches = [...order.note.matchAll(errorRegex)];
            
            let targetError = "";
            if (matches.length > 0) {
              targetError = matches[matches.length - 1][1].trim();
            } else {
              targetError = order.note.replace(/\.?\s*Order not confirmed\.?$/i, "").trim();
              targetError = targetError.replace(/^(?:error|message):\s*/i, "").trim();
            }

            const lowerErr = targetError.toLowerCase();
            const amountMatch = targetError.match(/Received:\s*(\d+),\s*Expected:\s*(\d+)/i);
            const contentMatch = targetError.match(/Received:\s*["']?([^,"']+)["']?,\s*Expected:\s*["']?([^,"']+)["']?/i);

            const isAmountError = (amountMatch && (lowerErr.includes("amount") || lowerErr.includes("payment amount"))) || lowerErr.includes("invalid payment amount");
            const isContentError = lowerErr.includes("content") || lowerErr.includes("description") || lowerErr.includes("code") || lowerErr.includes("transfer") || lowerErr.includes("not found") || lowerErr.includes("mismatch") || lowerErr.includes("incorrect");

            if (isAmountError && amountMatch) {
              setPaymentWarningData({
                type: 'amount',
                received: parseInt(amountMatch[1], 10),
                expected: parseInt(amountMatch[2], 10),
                message: targetError,
              });
            } else if (isContentError || contentMatch) {
              setPaymentWarningData({
                type: 'content',
                receivedContent: contentMatch ? contentMatch[1].trim() : null,
                expectedContent: contentMatch ? contentMatch[2].trim() : (createdOrder?.transferContent || null),
                message: targetError || "Invalid transfer content detected for this payment"
              });
            } else {
              setPaymentWarningData({
                type: 'other',
                message: targetError || "Invalid payment details or transfer content"
              });
            }
          } else if (order && (
            order.paymentStatus === "FAILED" || 
            order.paymentStatus === "ERROR" || 
            order.status === "FAILED"
          )) {
            setPolling(false);
            clearInterval(intervalId);
            setPaymentFailed(true);
          }
        } catch (err) {
          console.error("Polling error", err);
        }
      }, 3000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [polling, createdOrder, onSuccess]);

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
      if (timer) clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentSuccess, successCountdown]);

  useEffect(() => {
    let timer;
    if (createdOrder) {
      const expiresAt = new Date(createdOrder.createdAt).getTime() + 15 * 60000;
      
      timer = setInterval(() => {
        const now = new Date().getTime();
        const distance = expiresAt - now;
        
        if (distance <= 0) {
          clearInterval(timer);
          setTimeLeft(0);
        } else {
          setTimeLeft(Math.floor(distance / 1000));
        }
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    }
  }, [createdOrder]);

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
    const transferContent = createdOrder.transferContent || (createdOrder.orderCode ? `UN${createdOrder.orderCode.replace(/-/g, '')}` : '');
    
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
        footer={(paymentSuccess || paymentFailed) ? null : [
          <Button key="close" onClick={handleClosePayment}>
            Close
          </Button>
        ]}
        destroyOnHidden
      >
        <div className="flex flex-col items-center py-6">
          <div className="text-lg font-bold mb-2">Total: {formatVnd(createdOrder.totalPrice)}</div>
          <div className="text-sm text-slate-500 mb-4">Order Code: {createdOrder.orderCode}</div>
          
          {!paymentSuccess && (
            <div className="mb-4">
              <Tag color={timeLeft > 0 ? "orange" : "red"} style={{ margin: 0, padding: '4px 12px', fontSize: 14 }}>
                Expires in: {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </Tag>
            </div>
          )}

          {timeLeft === 0 && !paymentSuccess && !paymentFailed ? (
            <div className="flex flex-col items-center justify-center bg-red-50 p-6 rounded-lg text-center mb-4 border border-red-200">
              <span className="text-red-500 font-bold mb-2">QR Code Expired</span>
              <span className="text-sm text-slate-600 mb-4">The 15-minute payment window has closed. Please cancel this order and create a new one.</span>
              <Button danger onClick={handleCancelExpiredOrder} loading={creating}>
                Cancel Order
              </Button>
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
              {paymentWarning && paymentWarningData ? (
                <div className="bg-white border-2 border-red-200 rounded-xl mb-4 overflow-hidden shadow-sm w-full">
                  <div className="bg-red-50 px-4 py-2 border-b border-red-200 flex items-center justify-center gap-2">
                    <CloseCircleOutlined className="text-red-600 text-lg" />
                    <span className="font-bold text-red-700 uppercase tracking-wide">
                      {paymentWarningData.type === 'amount'
                        ? 'Invalid Payment Amount'
                        : paymentWarningData.type === 'content'
                        ? 'Invalid Transfer Content'
                        : 'Payment Details Error'}
                    </span>
                  </div>
                  <div className="p-4 text-center">
                    {paymentWarningData.type === 'amount' && paymentWarningData.received ? (
                      <>
                        <div className="flex justify-center items-center gap-6 mb-3">
                           <div className="flex flex-col items-end">
                              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Received</span>
                              <span className="text-lg font-bold text-red-600">{formatVnd(paymentWarningData.received)}</span>
                           </div>
                           <div className="h-10 w-px bg-red-200"></div>
                           <div className="flex flex-col items-start">
                              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Expected</span>
                              <span className="text-lg font-bold text-green-600">{formatVnd(paymentWarningData.expected)}</span>
                           </div>
                        </div>
                        <div className="text-xs text-red-800 bg-red-50 inline-block px-3 py-1 rounded-full border border-red-100 font-medium mb-3">
                          Difference: {formatVnd(Math.abs(paymentWarningData.expected - paymentWarningData.received))}
                        </div>
                      </>
                    ) : paymentWarningData.type === 'content' ? (
                      <div className="mb-3">
                        <div className="text-sm font-semibold text-red-600 bg-red-50 p-2.5 border border-red-100 rounded mb-2">
                          ⚠️ {paymentWarningData.message || "Invalid transfer content detected!"}
                        </div>
                        {(paymentWarningData.receivedContent || paymentWarningData.expectedContent) && (
                          <div className="text-xs text-slate-700 bg-red-50/50 p-2.5 rounded border border-red-100 mb-2 flex flex-col gap-1.5 text-left">
                            {paymentWarningData.receivedContent && (
                              <div>
                                <span className="text-slate-500 font-medium">Entered Content: </span>
                                <code className="bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-mono font-bold">{paymentWarningData.receivedContent}</code>
                              </div>
                            )}
                            {paymentWarningData.expectedContent && (
                              <div>
                                <span className="text-slate-500 font-medium">Correct Required Content: </span>
                                <code className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded font-mono font-bold">{paymentWarningData.expectedContent}</code>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm mt-1 mb-3 font-medium bg-red-50 text-red-600 p-2 border border-red-100 rounded">
                        {paymentWarningData.message || "Invalid transfer content detected"}
                      </div>
                    )}
                    <p className="text-xs text-slate-600 m-0">
                      Please scan the QR code below and transfer with the <b>exact amount and content</b> to complete your order.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded mb-4 text-sm w-full text-center">
                  <strong>⚠️ IMPORTANT WARNING:</strong><br />
                  Do <b>NOT</b> modify the transfer amount or content. Incorrect details will cause the system to reject the payment, and you will have to wait for the end-of-day revenue reconciliation to resolve it.
                </div>
              )}
              
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
