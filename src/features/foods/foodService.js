import apiClient from "../../services/apiClient";

const toListResult = (response) => ({
  data: response.data.items,
  pagination: response.data.pagination,
});

const multipartConfig = {
  headers: {
    "Content-Type": "multipart/form-data",
  },
};

const toFoodFormData = (payload = {}) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || key === "imageFile") return;
    if (key === "ingredients") {
      formData.append(key, JSON.stringify(value || []));
      return;
    }
    if (value === null) {
      formData.append(key, "");
      return;
    }
    formData.append(key, value);
  });

  if (payload.imageFile) {
    formData.append("image", payload.imageFile);
  }

  return formData;
};

export const foodService = {
  async getFoods() {
    const response = await apiClient.get("/foods");

    return response.data.items;
  },

  async getManagedFoods(params = {}) {
    const response = await apiClient.get("/foods", { params });

    return toListResult(response);
  },

  async getManagedFoodById(id) {
    const response = await apiClient.get(`/foods/${id}`);

    return response.data;
  },

  async createFood(payload) {
    const response = await apiClient.post(
      "/foods",
      toFoodFormData(payload),
      multipartConfig,
    );

    return response.data;
  },

  async updateFood(id, payload) {
    const response = await apiClient.patch(
      `/foods/${id}`,
      toFoodFormData(payload),
      multipartConfig,
    );

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

  async getDailyFoods() {
    const response = await apiClient.get("/foods/daily");

    return response.data;
  },
};
