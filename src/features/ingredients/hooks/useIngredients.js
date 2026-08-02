import { useState } from "react";
import { ingredientService } from "../ingredientService";
import { notify } from "../../../utils/notify";

/**
 * Hook to manage ingredients
 */
export function useIngredients() {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchIngredients = async (
    page = 1,
    pageSize = 10,
    searchKeyword = "",
    filters = {},
    sorter = {},
  ) => {
    try {
      setLoading(true);

      const response = await ingredientService.getIngredients({
        page,
        limit: pageSize,
        keyword: searchKeyword || undefined,
        categoryId: filters.categoryId,
        isActive: filters.isActive,
        storageType: filters.storageType,
        sortBy: sorter.sortBy,
        sortOrder: sorter.sortOrder,
      });

      setIngredients(response.data || []);

      setPagination({
        current: response.pagination.page,
        pageSize: response.pagination.limit,
        total: response.pagination.total,
      });
    } catch (err) {
      notify.error(err.message || "Cannot load ingredients");
    } finally {
      setLoading(false);
    }
  };

  const createIngredient = async (values) => {
    try {
      setSaving(true);
      await ingredientService.createIngredient(values);
      notify.success("Ingredient created successfully");
    } catch (err) {
      notify.error(err.message || "Cannot save ingredient");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const updateIngredient = async (id, values) => {
    try {
      setSaving(true);
      await ingredientService.updateIngredient(id, values);
      notify.success("Ingredient updated successfully");
    } catch (err) {
      notify.error(err.message || "Cannot save ingredient");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const getIngredientById = async (id) => {
    try {
      return await ingredientService.getIngredientById(id);
    } catch (err) {
      notify.error(err.message || "Cannot load ingredient detail");
      throw err;
    }
  };

  return {
    ingredients,
    loading,
    saving,
    pagination,
    fetchIngredients,
    createIngredient,
    updateIngredient,
    getIngredientById,
  };
}
