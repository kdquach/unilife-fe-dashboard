import apiClient from "../../services/apiClient";

export const reportService = {
  async getRevenueReport(params = {}) {
    const response = await apiClient.get("/reports/revenue", {
      params,
    });

    return {
      summary: response.data.summary,
      revenue: response.data.revenue,
    };
  },
  async getPeakHourReport(params = {}) {
    const response = await apiClient.get("/reports/peak-hour", {
      params,
    });

    return response.data;
  },
};
