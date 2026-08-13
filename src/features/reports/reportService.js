import apiClient from "../../services/apiClient";

export const reportService = {
  async getRevenueReport(params = {}) {
    const response = await apiClient.get("/reports/revenue", {
      params,
    });

    const payload = response?.data || response || {};
    return {
      summary: payload.summary || {},
      revenue: payload.revenue || [],
    };
  },
  async getPeakHourReport(params = {}) {
    const response = await apiClient.get("/reports/peak-hour", {
      params,
    });

    return response.data;
  },

  async getOrderStatisticsReport(params = {}) {
    const response = await apiClient.get("/reports/order-statistics", {
      params,
    });

    return response.data;
  },

  async getPopularFoodReport(params = {}) {
    const response = await apiClient.get("/reports/popular-food", {
      params,
    });

    return response.data;
  },
};
