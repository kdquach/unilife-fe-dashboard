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

  async createWalkInOrder(payload) {
    const response = await apiClient.post(
      "/orders/walk-in",
      payload
    );

    return response.data.data;
  },

  async scanPickupQr(payload) {
    const response = await apiClient.post("/orders/scan-pickup-qr", payload);

    return response.data;
  },
};
