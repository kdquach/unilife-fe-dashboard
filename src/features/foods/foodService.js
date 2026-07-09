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

  async getKitchenFoodById(id) {
    const response = await apiClient.get(`/foods/kitchen/${id}`);

    return response.data;
  },

  async searchKitchenFoods(params = {}) {
    const response = await apiClient.get("/foods/kitchen/search", { params });

    return {
      data: response.data.items,
      pagination: response.data.pagination,
    };
  },

  async filterKitchenFoods(params = {}) {
    const response = await apiClient.get("/foods/kitchen/filter", { params });

    return {
      data: response.data.items,
      pagination: response.data.pagination,
    };
  },

  async getKitchenFoodFilterOptions(params = {}) {
    const response = await apiClient.get("/foods/kitchen/filter-options", {
      params,
    });

    return response.data;
  },
};
