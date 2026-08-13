import { describe, it, expect, vi, beforeEach } from "vitest";
import { ingredientTransactionService } from "../ingredientTransactionService";
import apiClient from "../../../services/apiClient";

vi.mock("../../../services/apiClient");

describe("ingredientTransactionService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch ingredient transactions with unwrapListResponse", async () => {
    const mockResponse = {
      data: {
        items: [{ _id: "tx-1", type: "IMPORT", quantity: 50 }],
        pagination: { page: 1, limit: 10, total: 1 },
      },
    };
    apiClient.get.mockResolvedValueOnce(mockResponse);

    const result = await ingredientTransactionService.getIngredientTransactions({ page: 1 });

    expect(apiClient.get).toHaveBeenCalledWith("/ingredient-transactions", {
      params: { page: 1 },
    });
    expect(result.data).toEqual(mockResponse.data.items);
    expect(result.pagination.total).toBe(1);
  });

  it("should fetch transaction by id or return null if id is null", async () => {
    const nullRes = await ingredientTransactionService.getIngredientTransactionById(null);
    expect(nullRes).toBeNull();

    const mockTx = { _id: "tx-1", type: "IMPORT" };
    apiClient.get.mockResolvedValueOnce({ data: mockTx });

    const result = await ingredientTransactionService.getIngredientTransactionById("tx-1");
    expect(result).toEqual(mockTx);
  });

  it("should post new transaction payload", async () => {
    const payload = { ingredientId: "ing-1", type: "IMPORT", quantity: 20 };
    apiClient.post.mockResolvedValueOnce({ data: { _id: "tx-2", ...payload } });

    const result = await ingredientTransactionService.createIngredientTransaction(payload);

    expect(apiClient.post).toHaveBeenCalledWith("/ingredient-transactions", payload);
    expect(result._id).toBe("tx-2");
  });
});
