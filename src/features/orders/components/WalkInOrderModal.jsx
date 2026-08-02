import React, { useMemo, useState } from "react";
import { Modal, Input, Button, Space, Empty, Image, Badge, Tag, InputNumber, Select } from "antd";
import { PlusOutlined, MinusOutlined, DeleteOutlined, SearchOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { COLORS, formatVnd } from "../utils/orderUtils.jsx";
import { imageNotFound } from "../../../utils/image";

/**
 * Modal for creating walk-in orders with POS-style interface
 */
export default function WalkInOrderModal({ 
  open, 
  onClose, 
  foods, 
  foodsLoading,
  onCreateOrder 
}) {
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [note, setNote] = useState("");
  const [foodSearch, setFoodSearch] = useState("");
  const [creating, setCreating] = useState(false);

  // Reset state when modal opens
  React.useEffect(() => {
    if (open) {
      setCart([]);
      setPaymentMethod("CASH");
      setNote("");
      setFoodSearch("");
    }
  }, [open]);

  // Cart helpers
  const cartQuantityOf = (key) => cart.find((item) => item.key === key)?.quantity || 0;

  const addToCart = (food) => {
    const alreadyInCart = cartQuantityOf(food.key);

    if (alreadyInCart >= food.stockQuantity) {
      return; // Could show notification here
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.key === food.key);

      if (existing) {
        return prev.map((item) =>
          item.key === food.key ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }

      return [...prev, { ...food, quantity: 1 }];
    });
  };

  const updateCartQuantity = (key, quantity) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.key !== key) return item;

        const clamped = Math.max(1, Math.min(Number(quantity) || 1, item.stockQuantity));

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

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const filteredFoods = useMemo(() => {
    const q = foodSearch.trim().toLowerCase();
    if (!q) return foods;
    return foods.filter((food) => food.name.toLowerCase().includes(q));
  }, [foods, foodSearch]);

  const handleCreateWalkIn = async () => {
    if (cart.length === 0) {
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

      await onCreateOrder(payload);

      setCart([]);
      setPaymentMethod("CASH");
      setNote("");
      setFoodSearch("");
      onClose();
    } catch (error) {
      console.error(error);
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
      footer={null}
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
              <div className="col-span-full py-10 text-center text-slate-400">
                Loading today's menu...
              </div>
            )}

            {!foodsLoading && filteredFoods.length === 0 && (
              <div className="col-span-full py-10">
                <Empty description="No items available in today's menu" />
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
                        : "cursor-pointer border-slate-200 hover:shadow-md"
                    }`}
                    style={!soldOut ? { borderColor: undefined } : undefined}
                    onMouseEnter={(e) => {
                      if (!soldOut) e.currentTarget.style.borderColor = COLORS.orange;
                    }}
                    onMouseLeave={(e) => {
                      if (!soldOut) e.currentTarget.style.borderColor = "";
                    }}
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
                            backgroundColor: COLORS.orange,
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

                      <div className="text-xs font-semibold" style={{ color: COLORS.blue }}>
                        {formatVnd(food.price)}
                      </div>

                      <div className="mt-auto flex items-center justify-between pt-2">
                        <Tag color={soldOut ? "red" : "green"} style={{ margin: 0 }}>
                          {soldOut ? "Sold out" : `${remaining} left`}
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
        <div className="flex flex-col md:w-2/5 md:border-l md:pl-4">
          <div className="mb-2 flex items-center gap-2 font-semibold text-slate-700">
            <ShoppingCartOutlined style={{ color: COLORS.orange }} />
            Cart ({cartCount})
          </div>

          <div
            className="flex flex-col gap-2 overflow-y-auto pr-1"
            style={{ maxHeight: "34vh", minHeight: 80 }}
          >
            {cart.length === 0 && (
              <div className="py-6 text-center text-sm text-slate-400">
                No items selected yet. Click an item on the left to add it.
              </div>
            )}

            {cart.map((item) => (
              <div
                key={item.key}
                className="flex items-center gap-2 rounded-md border border-slate-100 p-2"
              >
                <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-slate-100">
                  <Image
                    src={item.imageUrl}
                    fallback={imageNotFound}
                    alt={item.name}
                    width={40}
                    height={40}
                    style={{ objectFit: "cover" }}
                    preview={false}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium" title={item.name}>
                    {item.name}
                  </div>
                  <div className="text-xs text-slate-400">{formatVnd(item.price)}</div>
                </div>

                <Space.Compact size="small">
                  <Button
                    icon={<MinusOutlined />}
                    onClick={() => updateCartQuantity(item.key, item.quantity - 1)}
                  />
                  <InputNumber
                    size="small"
                    min={1}
                    max={item.stockQuantity}
                    value={item.quantity}
                    onChange={(v) => updateCartQuantity(item.key, v || 1)}
                    style={{ width: 48, textAlign: "center" }}
                    controls={false}
                  />
                  <Button
                    icon={<PlusOutlined />}
                    disabled={item.quantity >= item.stockQuantity}
                    onClick={() => updateCartQuantity(item.key, item.quantity + 1)}
                  />
                </Space.Compact>

                <div className="text-right text-sm font-semibold" style={{ width: 84 }}>
                  {formatVnd(item.price * item.quantity)}
                </div>

                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => removeFromCart(item.key)}
                />
              </div>
            ))}
          </div>

          <div className="mt-3 border-t border-slate-100 pt-3">
            <div className="mb-3 flex items-center justify-between text-base">
              <span className="font-medium text-slate-600">Total</span>
              <span className="text-lg font-bold" style={{ color: COLORS.orange }}>
                {formatVnd(cartTotal)}
              </span>
            </div>

            <div className="mb-2">
              <div className="mb-1 text-xs text-slate-500">Payment method</div>
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

            <div className="mb-3">
              <div className="mb-1 text-xs text-slate-500">Note (optional)</div>
              <Input.TextArea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. customer requested mild spice..."
              />
            </div>

            <Button
              type="primary"
              block
              size="large"
              loading={creating}
              disabled={cart.length === 0}
              onClick={handleCreateWalkIn}
            >
              Create Order ({cartCount} item{cartCount === 1 ? "" : "s"} · {formatVnd(cartTotal)})
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
