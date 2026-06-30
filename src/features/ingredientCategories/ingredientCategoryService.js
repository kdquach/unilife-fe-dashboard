import apiClient from "../../services/apiClient";

export const ingredientCategoryService = {
  async getIngredientCategories(params = {}) {
    const response = await apiClient.get(
      "/ingredient-categories",
      {
        params,
      }
    );

    return {
      data: response.data.items,
      pagination: response.data.pagination,
    };
  },

  async getIngredientCategoryById(id) {
    const response = await apiClient.get(`/ingredient-categories/${id}`)
    return response.data;
  },

  async createIngredientCategory(data) {
    return await apiClient.post("/ingredient-categories", data)
  },

  async updateIngredientCategory(id, data) {
    return apiClient.patch(`/ingredient-categories/${id}`, data)
  },
};