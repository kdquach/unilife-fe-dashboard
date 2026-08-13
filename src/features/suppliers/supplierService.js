import apiClient from "../../services/apiClient";

export const supplierService = {
  async getSuppliers(params = {}) {
    const response = await apiClient.get("/suppliers", { params });
    const payload = response?.data || response || {};

    return {
      data: payload.items || payload.data || (Array.isArray(payload) ? payload : []),
      pagination: payload.pagination || { page: 1, limit: 10, total: 0 },
    };
  },

  async getSupplierById(id) {
    const response = await apiClient.get(`/suppliers/${id}`);

    return response?.data || response;
  },

  async createSupplier(payload) {
    const response = await apiClient.post("/suppliers", payload);

    return response?.data || response;
  },

  async updateSupplier(id, payload) {
    const response = await apiClient.patch(`/suppliers/${id}`, payload);

    return response?.data || response;
  },

  async deleteSupplier(id) {
    const response = await apiClient.delete(`/suppliers/${id}`);

    return response?.data || response;
  },

  async getSupplierBatches(id, params = {}) {
    const response = await apiClient.get(`/suppliers/${id}/batches`, { params });
    const payload = response?.data || response || {};

    return {
      data: payload.items || payload.data || (Array.isArray(payload) ? payload : []),
      pagination: payload.pagination || { page: 1, limit: 10, total: 0 },
    };
  },
};
