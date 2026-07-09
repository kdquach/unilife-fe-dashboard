import apiClient from "../../services/apiClient";

const toListResult = (response) => ({
  data: response.data.items,
  pagination: response.data.pagination,
});

export const foodService = {
  async getFoods() {
    const response = await apiClient.get("/foods");

    return response.data.items;
  },

  async getManagedFoods(params = {}) {
    const response = await apiClient.get("/foods", { params });

    return toListResult(response);
  },

  async createFood(payload) {
    const response = await apiClient.post("/foods", payload);

    return response.data;
  },

  async updateFood(id, payload) {
    const response = await apiClient.patch(`/foods/${id}`, payload);

    return response.data;
  },

  async getKitchenFoods(params = {}) {
    const response = await apiClient.get("/foods/kitchen", { params });

    return toListResult(response);
  },

  async getKitchenFoodById(id) {
    const response = await apiClient.get(`/foods/kitchen/${id}`);

    return response.data;
  },

  async searchKitchenFoods(params = {}) {
    const response = await apiClient.get("/foods/kitchen/search", { params });

    return toListResult(response);
  },

  async filterKitchenFoods(params = {}) {
    const response = await apiClient.get("/foods/kitchen/filter", { params });

    return toListResult(response);
  },

  async getKitchenFoodFilterOptions(params = {}) {
    const response = await apiClient.get("/foods/kitchen/filter-options", {
      params,
    });

    return response.data;
  },
};
