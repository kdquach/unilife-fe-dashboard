import apiClient from "../../services/apiClient";

const EMPTY_PAGINATION = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
};

const unwrapListResponse = (response) => {
  const payload = response?.data ?? {};
  const items = Array.isArray(payload.items)
    ? payload.items
    : Array.isArray(payload)
      ? payload
      : [];

  return {
    data: items,
    pagination: {
      ...EMPTY_PAGINATION,
      ...(payload.pagination || {}),
    },
  };
};

export const ingredientService = {
  async getIngredients(params = {}) {
    const response = await apiClient.get("/ingredients", { params });

    return unwrapListResponse(response);
  },

  async getIngredientById(id) {
    if (!id) return null;

    const response = await apiClient.get(`/ingredients/${id}`);

    return response?.data ?? null;
  },

  async createIngredient(payload) {
    const response = await apiClient.post("/ingredients", payload);

    return response?.data ?? null;
  },

  async updateIngredient(id, payload) {
    if (!id) throw new Error("Ingredient ID is required");

    const response = await apiClient.patch(`/ingredients/${id}`, payload);

    return response?.data ?? null;
  },

  async adjustIngredientStock(id, payload) {
    if (!id) throw new Error("Ingredient ID is required");

    const response = await apiClient.post(
      `/ingredients/${id}/adjust-stock`,
      payload,
    );

    return response?.data ?? null;
  },

  async recordStockImport(id, payload) {
    if (!id) throw new Error("Ingredient ID is required");

    const response = await apiClient.post(
      `/ingredients/${id}/stock-import`,
      payload,
    );

    return response?.data ?? null;
  },
};
