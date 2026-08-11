import { describe, it, expect, vi, beforeEach } from "vitest";
import { queueService } from "../queueService";
import apiClient from "../../../services/apiClient";

vi.mock("../../../services/apiClient");

describe("queueService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getMonitorQueue", () => {
    it("should return monitor queue data structure", async () => {
      const mockResponse = {
        data: {
          currentServing: { queueNumber: 10, orderCode: "UN010" },
          waiting: [{ queueNumber: 11, orderCode: "UN011" }],
          items: [{ _id: "q-1", queueNumber: 10 }],
          summary: { totalWaiting: 1, totalServed: 10 },
          pagination: { page: 1, limit: 10, total: 1 },
        },
      };
      apiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await queueService.getMonitorQueue({ page: 1 });

      expect(apiClient.get).toHaveBeenCalledWith("/queues/monitor", {
        params: { page: 1 },
      });
      expect(result.currentServing).toEqual(mockResponse.data.currentServing);
      expect(result.waiting).toEqual(mockResponse.data.waiting);
      expect(result.summary).toEqual(mockResponse.data.summary);
    });
  });

  describe("callNextNumber", () => {
    it("should call post to /queues/call-next", async () => {
      apiClient.post.mockResolvedValueOnce({ data: { queueNumber: 12 } });

      const result = await queueService.callNextNumber();

      expect(apiClient.post).toHaveBeenCalledWith("/queues/call-next");
      expect(result).toEqual({ queueNumber: 12 });
    });
  });

  describe("scanOrderQr", () => {
    it("should post scan payload to /queues/scan", async () => {
      const payload = { qrPayload: "ORDER_QR_DATA" };
      apiClient.post.mockResolvedValueOnce({ data: { success: true } });

      const result = await queueService.scanOrderQr(payload);

      expect(apiClient.post).toHaveBeenCalledWith("/queues/scan", payload);
      expect(result.success).toBe(true);
    });
  });
});
