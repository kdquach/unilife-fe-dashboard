import { describe, it, expect, vi, beforeEach } from "vitest";
import { ingredientService } from "../ingredientService";
import apiClient from "../../../services/apiClient";

vi.mock("../../../services/apiClient");

describe("ingredientService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getIngredients", () => {
    it("should fetch ingredients list with pagination", async () => {
      const mockResponse = {
        data: {
          items: [{ _id: "ing-1", name: "Gạo ST25", quantity: 50, unit: "kg" }],
          pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        },
      };
      apiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await ingredientService.getIngredients({ page: 1 });

      expect(apiClient.get).toHaveBeenCalledWith("/ingredients", { params: { page: 1 } });
      expect(result.data).toEqual(mockResponse.data.items);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe("getIngredientById", () => {
    it("should return null if id is not provided", async () => {
      const result = await ingredientService.getIngredientById(null);
      expect(result).toBeNull();
      expect(apiClient.get).not.toHaveBeenCalled();
    });

    it("should fetch ingredient by id", async () => {
      const mockIng = { _id: "ing-1", name: "Thịt heo" };
      apiClient.get.mockResolvedValueOnce({ data: mockIng });

      const result = await ingredientService.getIngredientById("ing-1");

      expect(apiClient.get).toHaveBeenCalledWith("/ingredients/ing-1");
      expect(result).toEqual(mockIng);
    });
  });

  describe("createIngredient", () => {
    it("should post new ingredient", async () => {
      const payload = { name: "Trứng gà", unit: "quả" };
      apiClient.post.mockResolvedValueOnce({ data: { _id: "ing-2", ...payload } });

      const result = await ingredientService.createIngredient(payload);

      expect(apiClient.post).toHaveBeenCalledWith("/ingredients", payload);
      expect(result._id).toBe("ing-2");
    });
  });

  describe("adjustIngredientStock", () => {
    it("should throw error if id is missing", async () => {
      await expect(ingredientService.adjustIngredientStock(null, {})).rejects.toThrow(
        "Ingredient ID is required"
      );
    });

    it("should post stock adjustment", async () => {
      const payload = { adjustmentType: "ADD", quantity: 10, reason: "Manual audit" };
      apiClient.post.mockResolvedValueOnce({ data: { success: true } });

      const result = await ingredientService.adjustIngredientStock("ing-1", payload);

      expect(apiClient.post).toHaveBeenCalledWith("/ingredients/ing-1/adjust-stock", payload);
      expect(result.success).toBe(true);
    });
  });

  describe("recordStockImport", () => {
    it("should post stock import data", async () => {
      const payload = { quantity: 100, pricePerUnit: 25000, supplierId: "sup-1" };
      apiClient.post.mockResolvedValueOnce({ data: { success: true } });

      const result = await ingredientService.recordStockImport("ing-1", payload);

      expect(apiClient.post).toHaveBeenCalledWith("/ingredients/ing-1/stock-import", payload);
      expect(result.success).toBe(true);
    });
  });
});
