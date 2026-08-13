import { useState } from "react";
import { foodCategoryService } from "../foodCategoryService";
import { notify } from "../../../utils/notify";

/**
 * Hook to manage food categories
 */
export function useFoodCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchCategories = async (
    page = pagination.current,
    pageSize = pagination.pageSize,
    searchKeyword = "",
    filters = {},
  ) => {
    try {
      setLoading(true);

      const response = await foodCategoryService.getFoodCategories({
        page,
        limit: pageSize,
        keyword: searchKeyword,
        ...filters,
      });

      setCategories(response.data);

      setPagination({
        current: response.pagination.page,
        pageSize: response.pagination.limit,
        total: response.pagination.total,
      });
    } catch (error) {
      notify.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (values) => {
    try {
      setSaving(true);
      await foodCategoryService.createFoodCategory(values);
      notify.success("Food category created");
    } catch (error) {
      notify.error(error.message);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const updateCategory = async (id, values) => {
    try {
      setSaving(true);
      await foodCategoryService.updateFoodCategory(id, values);
      notify.success("Food category updated");
    } catch (error) {
      notify.error(error.message);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const getCategoryById = async (id) => {
    try {
      return await foodCategoryService.getFoodCategoryById(id);
    } catch (error) {
      notify.error(error.message);
      throw error;
    }
  };

  return {
    categories,
    loading,
    saving,
    pagination,
    fetchCategories,
    createCategory,
    updateCategory,
    getCategoryById,
  };
}
