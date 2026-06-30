import apiClient from "../../services/apiClient";

export const foodCategoryService = {
  async getFoodCategories(params = {}) {
    const response = await apiClient.get("/food-categories", { params });

    return {
      data: response.data.items,
      pagination: response.data.pagination,
    };
  },

  async getFoodCategoryById(id) {
    const response = await apiClient.get(`/food-categories/${id}`);

    return response.data;
  },

  async createFoodCategory(payload) {
    const response = await apiClient.post("/food-categories", payload);

    return response.data;
  },

  async updateFoodCategory(id, payload) {
    const response = await apiClient.patch(`/food-categories/${id}`, payload);

    return response.data;
  },
};
