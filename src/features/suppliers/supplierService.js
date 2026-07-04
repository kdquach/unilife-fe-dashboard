import apiClient from "../../services/apiClient";

export const supplierService = {
  async getSuppliers(params = {}) {
    const response = await apiClient.get("/suppliers", { params });

    return {
      data: response.data.items,
      pagination: response.data.pagination,
    };
  },

  async getSupplierById(id) {
    const response = await apiClient.get(`/suppliers/${id}`);

    return response.data;
  },

  async createSupplier(payload) {
    const response = await apiClient.post("/suppliers", payload);

    return response.data;
  },

  async updateSupplier(id, payload) {
    const response = await apiClient.patch(`/suppliers/${id}`, payload);

    return response.data;
  },

  async deleteSupplier(id) {
    const response = await apiClient.delete(`/suppliers/${id}`);

    return response.data;
  },

  async getSupplierBatches(id, params = {}) {
    const response = await apiClient.get(`/suppliers/${id}/batches`, { params });

    return {
      data: response.data.items,
      pagination: response.data.pagination,
    };
  },
};
