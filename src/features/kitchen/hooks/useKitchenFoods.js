import { useState } from "react";
import { foodService } from "../../foods/foodService";
import { notify } from "../../../utils/notify";

const hasActiveFilters = (filters) =>
  Object.values(filters).some(
    (value) => value !== undefined && value !== null && value !== "",
  );

/**
 * Hook to manage kitchen foods
 */
export function useKitchenFoods() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchFoods = async (
    page = pagination.current,
    limit = pagination.pageSize,
    searchKeyword = "",
    filters = {},
  ) => {
    try {
      setLoading(true);

      const params = {
        page,
        limit,
        keyword: searchKeyword || undefined,
        ...filters,
      };

      const response = hasActiveFilters(filters)
        ? await foodService.filterKitchenFoods(params)
        : searchKeyword
          ? await foodService.searchKitchenFoods(params)
          : await foodService.getKitchenFoods(params);

      setFoods(response.data);

      setPagination({
        current: response.pagination.page,
        pageSize: response.pagination.limit,
        total: response.pagination.total,
      });
    } catch (error) {
      notify.error("Foods Load Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    foods,
    loading,
    pagination,
    fetchFoods,
  };
}
