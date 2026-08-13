export const COLORS = {
  orange: "#f97316",
  green: "#22c55e",
  blue: "#3b82f6",
  red: "#ef4444",
  purple: "#a855f7",
  cyan: "#06b6d4",
  gold: "#eab308",
};

export function normalizeTodayMenuItems(todayMenu) {
  if (!todayMenu) return [];

  const rawItems = todayMenu.items || (Array.isArray(todayMenu) ? todayMenu : []);

  return rawItems
    .filter((item) => item.isActive !== false && item.foodId)
    .map((item) => {
      const food = item.foodId || {};
      const menuScheduleItemId = item.menuScheduleItemId || item._id;
      const stockQuantity =
        typeof item.remainingCount === "number"
          ? item.remainingCount
          : typeof item.remainingQuantity === "number"
            ? item.remainingQuantity
            : typeof item.quantity === "number"
              ? item.quantity
              : (food.stockQuantity ?? 999);

      return {
        ...food,
        key: menuScheduleItemId,
        foodId: food._id || food.id,
        menuScheduleItemId,
        name: food.name || "Unknown",
        originalPrice: food.price || 0,
        price: food.price || 0,
        soldCount: item.soldCount || 0,
        stockQuantity,
        menuIsActive: item.isActive !== false,
        isMenuItem: true,
        isDailyFood: false,
      };
    })
    .filter((f) => f.key && f.stockQuantity > 0);
}

export function normalizeDailyFoods(dailyFoods) {
  if (!dailyFoods || !Array.isArray(dailyFoods)) return [];

  return dailyFoods
    .filter((food) => food.isActive !== false)
    .map((food) => ({
      ...food,
      key: `daily_${food._id || food.id}`,
      foodId: food._id || food.id,
      menuScheduleItemId: null,
      name: food.name || "Unknown",
      price: food.price ?? 0,
      stockQuantity: food.stockQuantity ?? 999,
      isMenuItem: false,
      isDailyFood: true,
    }));
}
