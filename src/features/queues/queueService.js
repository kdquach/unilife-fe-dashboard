import apiClient from "../../services/apiClient";

export const queueService = {
  async getMonitorQueue(params = {}) {
    const response = await apiClient.get("/queues/monitor", {
      params,
    });

    return {
      currentServing: response.data.currentServing,
      waiting: response.data.waiting,
      data: response.data.items,
      summary: response.data.summary,
      pagination: response.data.pagination,
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
