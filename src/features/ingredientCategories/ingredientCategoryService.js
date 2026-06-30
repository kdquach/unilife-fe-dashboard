import apiClient from "../../services/apiClient";

export const ingredientCategoryService = {
  async getIngredientCategories(params = {}) {
    const response = await apiClient.get(
      "/ingredient-categories",
      {
        params,
      }
    );
    console.log(response);

    return {
      data: response.data.items,
      pagination: response.data.pagination,
    };
  },
};