import React, { useState, useMemo } from "react";
import { Modal, Input, Button, Space, Tag, Empty, Badge, Image, Form, Select, Spin } from "antd";
import { PlusOutlined, MinusOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import { notify } from "../../../utils/notify";
import { getImageUrl, imageNotFound } from "../../../utils/image";
import menuScheduleApi from "../../menuSchedules/api/menuScheduleApi";
import { orderService } from "../orderService";

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
      };
    })
    .filter((f) => f.key && f.stockQuantity > 0);
}

export default function WalkInOrderModal({ open, onClose, onSuccess }) {
  const [foods, setFoods] = useState([]);
  const [foodsLoading, setFoodsLoading] = useState(false);
  const [foodSearch, setFoodSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [note, setNote] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchTodayMenuFoods = async () => {
    try {
      setFoodsLoading(true);
      const response = await menuScheduleApi.getTodayMenuSchedule();
      const todayMenu = response?.data ?? response;
      const normalized = normalizeTodayMenuItems(todayMenu);
      setFoods(normalized);
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
    if (cart.length === 0) {
      notify.warning(
  "Cart is Empty",
  "Please select at least one item before creating an order.",
);
      return;
    }

    try {
      setCreating(true);

      const payload = {
        paymentMethod,
        items: cart.map((item) => ({
          menuScheduleItemId: item.menuScheduleItemId,
          itemType: "MENU_ITEM",
          quantity: item.quantity,
        })),
      };

      if (note.trim()) {
        payload.note = note.trim();
      }

      await orderService.createWalkInOrder(payload);

      notify.success(
        "Walk-in Order Created",
        "Order has been created successfully.",
      );

      onClose();
      onSuccess();
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

  return (
    <Modal
      title="Create Walk-in Order"
      open={open}
      width={960}
      onCancel={onClose}
      onOk={handleCreateWalkIn}
      confirmLoading={creating}
      destroyOnClose
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
