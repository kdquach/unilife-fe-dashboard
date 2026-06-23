import apiClient from "../../services/apiClient";

export const queueService = {
  async getMonitorQueue(params = {}) {
    const response = await apiClient.get("/queues/monitor", {
      params,
    });

    return {
      data: response.data.items,
      summary: response.data.summary,
      pagination: response.data.pagination,
    };
  },

  async callNextNumber() {
    const response = await apiClient.post("/queues/call-next");

    return response.data;
  },
};
