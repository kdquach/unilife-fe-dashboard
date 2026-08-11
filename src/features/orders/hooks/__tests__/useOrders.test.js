import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useOrders } from "../useOrders";
import { orderService } from "../../orderService";

vi.mock("../../orderService");

describe("useOrders hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default states", () => {
    const { result } = renderHook(() => useOrders());

    expect(result.current.orders).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.pagination).toEqual({
      current: 1,
      pageSize: 10,
      total: 0,
    });
  });

  it("should fetch orders successfully and update state and pagination", async () => {
    const mockOrders = [
      { _id: "order-1", orderCode: "UN001", totalPrice: 35000 },
      { _id: "order-2", orderCode: "UN002", totalPrice: 45000 },
    ];
    orderService.getOrders.mockResolvedValueOnce({
      data: mockOrders,
      pagination: { page: 1, limit: 10, total: 2 },
    });

    const { result } = renderHook(() => useOrders());

    await act(async () => {
      await result.current.fetchOrders(1, 10, "UN001", { status: "PAID" });
    });

    expect(orderService.getOrders).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      keyword: "UN001",
      status: "PAID",
    });
    expect(result.current.orders).toEqual(mockOrders);
    expect(result.current.pagination.total).toBe(2);
    expect(result.current.loading).toBe(false);
  });

  it("should support silent background polling without setting loading state", async () => {
    const mockOrders = [{ _id: "order-1", orderCode: "UN001" }];
    orderService.getOrders.mockResolvedValueOnce({
      data: mockOrders,
      pagination: { page: 1, limit: 10, total: 1 },
    });

    const { result } = renderHook(() => useOrders());

    await act(async () => {
      await result.current.fetchOrders(1, 10, "", {}, true);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.orders).toEqual(mockOrders);
  });

  it("should handle fetch error without throwing uncaught exception", async () => {
    orderService.getOrders.mockRejectedValueOnce(new Error("Network Error"));

    const { result } = renderHook(() => useOrders());

    await act(async () => {
      await result.current.fetchOrders();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.orders).toEqual([]);
  });
});
