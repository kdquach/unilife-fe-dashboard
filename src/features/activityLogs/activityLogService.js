import apiClient from "../../services/apiClient";

export const activityLogService = {
  async getActivityLogs(params = {}) {
    const response = await apiClient.get("/activity-logs", { params });
    return {
      items: response.data.items,
      pagination: response.data.pagination,
    };
  },

  async getActivityLogById(id) {
    const response = await apiClient.get(`/activity-logs/${id}`);
    return response.data;
  },
};
