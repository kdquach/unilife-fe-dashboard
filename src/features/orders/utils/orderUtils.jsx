import { Tag } from "antd";
import { getImageUrl } from "../../../utils/image";

// ---------- Brand palette ----------
const COLORS = {
  orange: "#fa8c16",
  orangeSoft: "#fff3e0",
  orangeBorder: "#ffd8a8",
  blue: "#1677ff",
  blueSoft: "#e8f3ff",
  green: "#52c41a",
  greenSoft: "#edfaea",
  red: "#ff4d4f",
  redSoft: "#fff1f0",
  purple: "#722ed1",
  purpleSoft: "#f9f0ff",
  ink: "#1f2430",
  subtle: "#8a94a6",
};

/**
 * Format value to Vietnamese Dong currency
 */
export const formatVnd = (value) => `${Number(value || 0).toLocaleString("en-US")} đ`;

/**
 * Normalizes the response from GET /menu-schedules/today into a list of
 * selectable items for the walk-in order builder.
 *
 * Actual response shape: { success, message, data: { items: [ {
 *   _id, menuScheduleItemId, foodId: { _id, name, price, imageUrl,
 *   isMenuItem, isActive, categoryId, ... },
 *   maxServing, reservedCount, servedCount, remainingCount, isActive
 * } ] } }
 *
 * `remainingCount` = maxServing - reservedCount - servedCount, i.e. the
 * number of servings still available to sell today -> used to show stock
 * and to prevent selecting more than what's available.
 */
export function normalizeTodayMenuItems(todayMenu) {
  if (!todayMenu) return [];

  const rawItems = todayMenu.items || [];

  return rawItems
    .filter((item) => item.isActive !== false && item.foodId)
    .map((item) => {
      const food = item.foodId || {};

      const menuScheduleItemId = item.menuScheduleItemId || item._id;

      return {
        // Unique key used both in the picker grid and the cart; the
        // walk-in order created from today's menu needs to reference
        // menuScheduleItemId when submitted to the backend.
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

/**
 * Render order status as a colored tag
 */
export const renderOrderStatus = (status) => {
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

/**
 * Render payment status as a colored tag
 */
export const renderPaymentStatus = (status) => {
  const colors = {
    PENDING: "orange",
    PAID: "green",
    FAILED: "red",
    REFUND_PENDING: "gold",
    REFUNDED: "blue",
  };

  return <Tag color={colors[status] || "default"}>{status}</Tag>;
};

/**
 * Check if an order can be scanned for pickup
 * Order must be paid, in PAID or CONFIRMED status, and not have a queue yet
 */
export const canScanPickup = (order) =>
  order?.paymentStatus === "PAID" && ["PAID", "CONFIRMED"].includes(order?.status) && !order?.queue;

export { COLORS };
