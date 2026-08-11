import { describe, it, expect, vi, beforeEach } from "vitest";
import { foodService } from "../foodService";
import apiClient from "../../../services/apiClient";

vi.mock("../../../services/apiClient");

describe("foodService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getManagedFoods", () => {
    it("should fetch foods and return toListResult", async () => {
      const mockResponse = {
        data: {
          items: [{ _id: "food-1", name: "Phở bò", price: 40000 }],
          pagination: { page: 1, limit: 10, total: 1 },
        },
      };
      apiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await foodService.getManagedFoods({ page: 1 });

      expect(apiClient.get).toHaveBeenCalledWith("/foods", { params: { page: 1 } });
      expect(result.data).toEqual(mockResponse.data.items);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe("createFood", () => {
    it("should send multipart form data for new food creation", async () => {
      const payload = {
        name: "Cơm chiên Dương Châu",
        price: 35000,
        ingredients: [{ ingredientId: "ing-1", quantity: 100 }],
      };
      apiClient.post.mockResolvedValueOnce({ data: { _id: "food-2", ...payload } });

      const result = await foodService.createFood(payload);

      expect(apiClient.post).toHaveBeenCalledWith(
        "/foods",
        expect.any(FormData),
        expect.objectContaining({ headers: { "Content-Type": "multipart/form-data" } })
      );
      expect(result._id).toBe("food-2");
    });
  });

  describe("getKitchenFoods", () => {
    it("should get kitchen foods with params", async () => {
      apiClient.get.mockResolvedValueOnce({
        data: { items: [{ _id: "kf-1" }], pagination: { total: 1 } },
      });

      const result = await foodService.getKitchenFoods({ page: 1 });

      expect(apiClient.get).toHaveBeenCalledWith("/foods/kitchen", { params: { page: 1 } });
      expect(result.data.length).toBe(1);
    });
  });
});
