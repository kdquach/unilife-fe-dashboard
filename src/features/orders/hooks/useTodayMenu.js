import { useState } from "react";
import menuScheduleApi from "../../menuSchedules/api/menuScheduleApi";
import { notify } from "../../../utils/notify";
import { normalizeTodayMenuItems } from "../utils/orderUtils.jsx";

/**
 * Hook to fetch and manage today's menu items for walk-in orders
 */
export function useTodayMenu() {
  const [foods, setFoods] = useState([]);
  const [foodsLoading, setFoodsLoading] = useState(false);

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
        "Load Today's Menu Failed",
        error?.response?.data?.message || "Cannot load today's menu for walk-in order.",
      );

      setFoods([]);
    } finally {
      setFoodsLoading(false);
    }
  };

  return {
    foods,
    foodsLoading,
    fetchTodayMenuFoods,
  };
}
