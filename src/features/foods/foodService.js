import apiClient from "../../services/apiClient";

export const foodService = {
  async getFoods() {
    const response = await apiClient.get("/foods");

    return response.data.items;
  },

  async getManagedFoods(params = {}) {
    const response = await apiClient.get("/foods", { params });

    return {
      data: response.data.items,
      pagination: response.data.pagination,
    };
  },

  async createFood(payload) {
    const response = await apiClient.post("/foods", payload);

    return response.data;
  },

  async updateFood(id, payload) {
    const response = await apiClient.patch(`/foods/${id}`, payload);

    return response.data;
  },
};
