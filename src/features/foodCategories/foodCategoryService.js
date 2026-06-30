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
};
