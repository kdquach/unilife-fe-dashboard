import apiClient from "../../services/apiClient";

export const queueService = {
  async getMonitorQueue(params = {}) {
    const response = await apiClient.get("/queues/monitor", {
      params,
    });

    const payload = response?.data || response || {};
    return {
      currentServing: payload.currentServing || null,
      waiting: payload.waiting || [],
      data: payload.items || payload.data || (Array.isArray(payload) ? payload : []),
      summary: payload.summary || {},
      pagination: payload.pagination || { page: 1, limit: 10, total: 0 },
    };
  },

  async callNextNumber() {
    const response = await apiClient.post("/queues/call-next");

    return response.data;
  },

  async scanOrderQr(payload) {
    const response = await apiClient.post("/queues/scan", payload);

    return response.data;
  },
};
