import { describe, it, expect, vi, beforeEach } from "vitest";
import { reportService } from "../reportService";
import apiClient from "../../../services/apiClient";

vi.mock("../../../services/apiClient");

describe("reportService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should get revenue report", async () => {
    const mockData = {
      summary: { totalRevenue: 15000000, totalOrders: 350 },
      revenue: [{ date: "2026-08-01", total: 500000 }],
    };
    apiClient.get.mockResolvedValueOnce({ data: mockData });

    const result = await reportService.getRevenueReport({ fromDate: "2026-08-01" });

    expect(apiClient.get).toHaveBeenCalledWith("/reports/revenue", {
      params: { fromDate: "2026-08-01" },
    });
    expect(result.summary).toEqual(mockData.summary);
    expect(result.revenue).toEqual(mockData.revenue);
  });

  it("should get peak hour report", async () => {
    const mockPeak = [{ hour: 12, orderCount: 85 }];
    apiClient.get.mockResolvedValueOnce({ data: mockPeak });

    const result = await reportService.getPeakHourReport({ date: "2026-08-11" });

    expect(apiClient.get).toHaveBeenCalledWith("/reports/peak-hour", {
      params: { date: "2026-08-11" },
    });
    expect(result).toEqual(mockPeak);
  });

  it("should get order statistics report", async () => {
    const mockStats = { total: 100, completed: 90, cancelled: 10 };
    apiClient.get.mockResolvedValueOnce({ data: mockStats });

    const result = await reportService.getOrderStatisticsReport();

    expect(apiClient.get).toHaveBeenCalledWith("/reports/order-statistics", { params: {} });
    expect(result).toEqual(mockStats);
  });

  it("should get popular foods report", async () => {
    const mockPop = [{ foodName: "Cơm sườn", orderCount: 200 }];
    apiClient.get.mockResolvedValueOnce({ data: mockPop });

    const result = await reportService.getPopularFoodReport();

    expect(apiClient.get).toHaveBeenCalledWith("/reports/popular-food", { params: {} });
    expect(result).toEqual(mockPop);
  });
});
