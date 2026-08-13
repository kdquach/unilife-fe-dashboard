import { useState } from "react";
import { foodService } from "../foodService";
import { notify } from "../../../utils/notify";

/**
 * Hook to manage foods
 */
export function useFoods() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchFoods = async (params) => {
    try {
      setLoading(true);

      // Handle both object and individual parameter calls
      const page = typeof params === 'object' ? params.page : params;
      const pageSize = typeof params === 'object' ? params.pageSize : arguments[1];
      const searchKeyword = typeof params === 'object' ? params.searchKeyword : arguments[2];
      const filters = typeof params === 'object' ? (params.nextFilters || params.filters || {}) : (arguments[3] || {});

      const response = await foodService.getManagedFoods({
        page,
        limit: pageSize,
        keyword: searchKeyword || undefined,
        categoryId: filters.categoryId,
        isActive: filters.isActive,
        isMenuItem: filters.isMenuItem,
      });

      setFoods(response.data || []);

      setPagination({
        current: response.pagination.page,
        pageSize: response.pagination.limit,
        total: response.pagination.total,
      });
    } catch (err) {
      notify.error(err.message || "Cannot load foods");
    } finally {
      setLoading(false);
    }
  };

  const createFood = async (values) => {
    try {
      setSaving(true);
      await foodService.createFood(values);
      notify.success("Food created successfully");
    } catch (err) {
      notify.error(err.message || "Cannot save food");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const updateFood = async (id, values) => {
    try {
      setSaving(true);
      await foodService.updateFood(id, values);
      notify.success("Food updated successfully");
    } catch (err) {
      notify.error(err.message || "Cannot save food");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const getFoodById = async (id) => {
    try {
      return await foodService.getManagedFoodById(id);
    } catch (err) {
      notify.error(err.message || "Cannot load food detail");
      throw err;
    }
  };

  return {
    foods,
    loading,
    saving,
    pagination,
    fetchFoods,
    createFood,
    updateFood,
    getFoodById,
  };
}
