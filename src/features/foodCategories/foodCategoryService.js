import apiClient from "../../services/apiClient";

export const foodCategoryService = {
  async getFoodCategories(params = {}) {
    const response = await apiClient.get("/food-categories", { params });

    return {
      data: response.data.items,
      pagination: response.data.pagination,
    };
  },
};
