import { useState } from "react";
import { ingredientCategoryService } from "../ingredientCategoryService";
import { notify } from "../../../utils/notify";

/**
 * Hook to manage ingredient categories
 */
export function useIngredientCategories() {
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
  ) => {
    try {
      setLoading(true);

      const response = await ingredientCategoryService.getIngredientCategories({
        page,
        limit: pageSize,
        keyword: searchKeyword,
      });

      setCategories(response.data);

      setPagination({
        current: response.pagination.page,
        pageSize: response.pagination.limit,
        total: response.pagination.total,
      });
    } catch (err) {
      notify.error(err.message || "Fetch failed");
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (values) => {
    try {
      setSaving(true);
      await ingredientCategoryService.createIngredientCategory(values);
      notify.success("Category created successfully");
    } catch (err) {
      notify.error(err.message || "Something went wrong");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const updateCategory = async (id, values) => {
    try {
      setSaving(true);
      await ingredientCategoryService.updateIngredientCategory(id, values);
      notify.success("Category updated successfully");
    } catch (err) {
      notify.error(err.message || "Something went wrong");
      throw err;
    } finally {
      setSaving(false);
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
  };
}
