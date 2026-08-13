import { describe, it, expect, vi, beforeEach } from "vitest";
import { orderService } from "../orderService";
import apiClient from "../../../services/apiClient";

vi.mock("../../../services/apiClient");

describe("orderService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getOrders", () => {
    it("should fetch orders and return normalized items and pagination", async () => {
      const mockResponse = {
        data: {
          items: [{ _id: "order-1", orderCode: "UN001", totalPrice: 50000 }],
          pagination: { page: 1, limit: 10, total: 1 },
        },
      };
      apiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await orderService.getOrders({ page: 1, limit: 10 });

      expect(apiClient.get).toHaveBeenCalledWith("/orders", {
        params: { page: 1, limit: 10 },
      });
      expect(result.data).toEqual(mockResponse.data.items);
      expect(result.pagination).toEqual(mockResponse.data.pagination);
    });

    it("should handle empty or fallback array response gracefully", async () => {
      apiClient.get.mockResolvedValueOnce({ data: [] });

      const result = await orderService.getOrders();

      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe("getOrderById", () => {
    it("should fetch single order by id", async () => {
      const mockOrder = { _id: "order-1", orderCode: "UN001" };
      apiClient.get.mockResolvedValueOnce({ data: mockOrder });

      const result = await orderService.getOrderById("order-1");

      expect(apiClient.get).toHaveBeenCalledWith("/orders/order-1");
      expect(result).toEqual(mockOrder);
    });
  });

  describe("createWalkInOrder", () => {
    it("should post walk-in order payload to /orders/walk-in", async () => {
      const payload = {
        items: [{ menuScheduleItemId: "item-1", quantity: 2 }],
        paymentMethod: "CASH",
      };
      const mockCreated = { _id: "order-2", orderCode: "UN002", status: "PAID" };
      apiClient.post.mockResolvedValueOnce({ data: mockCreated });

      const result = await orderService.createWalkInOrder(payload);

      expect(apiClient.post).toHaveBeenCalledWith("/orders/walk-in", payload);
      expect(result).toEqual(mockCreated);
    });
  });

  describe("updateOrder", () => {
    it("should patch order by id", async () => {
      const payload = { status: "COMPLETED" };
      apiClient.patch.mockResolvedValueOnce({ data: { _id: "order-1", status: "COMPLETED" } });

      const result = await orderService.updateOrder("order-1", payload);

      expect(apiClient.patch).toHaveBeenCalledWith("/orders/order-1", payload);
      expect(result.status).toBe("COMPLETED");
    });
  });

  describe("scanPickupQr", () => {
    it("should send direct orderCode if provided in payload", async () => {
      apiClient.post.mockResolvedValueOnce({ data: { success: true, orderCode: "UN001" } });

      const result = await orderService.scanPickupQr({ orderCode: "UN001" });

      expect(apiClient.post).toHaveBeenCalledWith("/orders/scan-pickup-qr", { orderCode: "UN001" });
      expect(result.success).toBe(true);
    });

    it("should parse and format valid qrPayload JSON string", async () => {
      apiClient.post.mockResolvedValueOnce({ data: { success: true } });
      const qrPayload = JSON.stringify({ type: "UNILIFE_PICKUP", orderId: "123" });

      await orderService.scanPickupQr({ qrPayload });

      expect(apiClient.post).toHaveBeenCalledWith("/orders/scan-pickup-qr", { qrPayload });
    });

    it("should wrap plain text order code into UNILIFE_PICKUP JSON", async () => {
      apiClient.post.mockResolvedValueOnce({ data: { success: true } });

      await orderService.scanPickupQr({ qrPayload: "RAW_CODE_123" });

      expect(apiClient.post).toHaveBeenCalledWith("/orders/scan-pickup-qr", {
        qrPayload: JSON.stringify({
          type: "UNILIFE_PICKUP",
          orderCode: "RAW_CODE_123",
        }),
      });
    });

    it("should throw error if neither orderCode nor qrPayload is provided", async () => {
      await expect(orderService.scanPickupQr({})).rejects.toThrow(
        "Order ID, order code or QR payload is required"
      );
    });
  });
});
