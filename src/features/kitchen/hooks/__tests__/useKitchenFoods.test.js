import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useKitchenFoods } from "../useKitchenFoods";
import { foodService } from "../../../foods/foodService";
import { notify } from "../../../../utils/notify";

vi.mock("../../../foods/foodService");
vi.mock("../../../../utils/notify", () => ({
  notify: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

describe("useKitchenFoods hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default states", () => {
    const { result } = renderHook(() => useKitchenFoods());

    expect(result.current.foods).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it("should fetch kitchen foods with standard list api", async () => {
    const mockList = [
      { _id: "kf-1", name: "Phở bò", isAvailable: true },
    ];
    foodService.getKitchenFoods.mockResolvedValueOnce({
      data: mockList,
      pagination: { page: 1, limit: 10, total: 1 },
    });

    const { result } = renderHook(() => useKitchenFoods());

    await act(async () => {
      await result.current.fetchFoods(1, 10);
    });

    expect(foodService.getKitchenFoods).toHaveBeenCalled();
    expect(result.current.foods).toEqual(mockList);
    expect(result.current.loading).toBe(false);
  });

  it("should use search api when searchKeyword is provided", async () => {
    const mockSearchList = [{ _id: "kf-2", name: "Bún chả" }];
    foodService.searchKitchenFoods.mockResolvedValueOnce({
      data: mockSearchList,
      pagination: { page: 1, limit: 10, total: 1 },
    });

    const { result } = renderHook(() => useKitchenFoods());

    await act(async () => {
      await result.current.fetchFoods(1, 10, "Bún");
    });

    expect(foodService.searchKitchenFoods).toHaveBeenCalledWith(
      expect.objectContaining({ keyword: "Bún" })
    );
    expect(result.current.foods).toEqual(mockSearchList);
  });

  it("should use filter api when active filters are present", async () => {
    foodService.filterKitchenFoods.mockResolvedValueOnce({
      data: [],
      pagination: { page: 1, limit: 10, total: 0 },
    });

    const { result } = renderHook(() => useKitchenFoods());

    await act(async () => {
      await result.current.fetchFoods(1, 10, "", { isAvailable: true });
    });

    expect(foodService.filterKitchenFoods).toHaveBeenCalled();
  });
});
