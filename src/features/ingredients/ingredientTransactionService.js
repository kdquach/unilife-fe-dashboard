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

export const ingredientTransactionService = {
  async getIngredientTransactions(params = {}) {
    const response = await apiClient.get("/ingredient-transactions", {
      params,
    });

    return unwrapListResponse(response);
  },

  async getIngredientTransactionById(id) {
    if (!id) return null;

    const response = await apiClient.get(`/ingredient-transactions/${id}`);

    return response?.data ?? null;
  },

  async createIngredientTransaction(payload) {
    const response = await apiClient.post("/ingredient-transactions", payload);

    return response?.data ?? null;
  },
};
