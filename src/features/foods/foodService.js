import apiClient from "../../services/apiClient";

export const foodService = {
  async getFoods() {
    const response = await apiClient.get("/foods");

    return response.data.items;
  },

  async getKitchenFoods(params = {}) {
    const response = await apiClient.get("/foods/kitchen", { params });

    return {
      data: response.data.items,
      pagination: response.data.pagination,
    };
  },
};
