import apiClient from "../../services/apiClient";

export const orderService = {
  async getOrders(params = {}) {
    const response = await apiClient.get("/orders", {
      params,
    });

    return {
      data: response.data.items,
      pagination: response.data.pagination,
    };
  },
};