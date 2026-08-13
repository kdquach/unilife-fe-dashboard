import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTodayMenu } from "../useTodayMenu";
import menuScheduleApi from "../../../menuSchedules/api/menuScheduleApi";
import { notify } from "../../../../utils/notify";

vi.mock("../../../menuSchedules/api/menuScheduleApi");
vi.mock("../../../../utils/notify", () => ({
  notify: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

describe("useTodayMenu hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with empty foods and not loading", () => {
    const { result } = renderHook(() => useTodayMenu());

    expect(result.current.foods).toEqual([]);
    expect(result.current.foodsLoading).toBe(false);
  });

  it("should fetch today menu and normalize items correctly", async () => {
    const mockSchedule = {
      _id: "sched-1",
      date: "2026-08-11",
      items: [
        {
          _id: "item-1",
          menuScheduleItemId: "item-1",
          isActive: true,
          soldCount: 5,
          foodId: {
            _id: "food-1",
            name: "Cơm tấm sườn bì",
            price: 35000,
            imageUrl: "https://example.com/comtam.jpg",
          },
        },
      ],
    };
    menuScheduleApi.getTodayMenuSchedule.mockResolvedValueOnce({ data: mockSchedule });

    const { result } = renderHook(() => useTodayMenu());

    await act(async () => {
      await result.current.fetchTodayMenuFoods();
    });

    expect(menuScheduleApi.getTodayMenuSchedule).toHaveBeenCalled();
    expect(result.current.foods.length).toBe(1);
    expect(result.current.foods[0]._id).toBe("food-1");
    expect(result.current.foods[0].name).toBe("Cơm tấm sườn bì");
    expect(result.current.foods[0].menuScheduleItemId).toBe("item-1");
    expect(result.current.foodsLoading).toBe(false);
  });

  it("should handle error when fetching today menu fails", async () => {
    menuScheduleApi.getTodayMenuSchedule.mockRejectedValueOnce(new Error("Menu not available"));

    const { result } = renderHook(() => useTodayMenu());

    await act(async () => {
      await result.current.fetchTodayMenuFoods();
    });

    expect(notify.error).toHaveBeenCalledWith(
      "Load Today's Menu Failed",
      expect.any(String)
    );
    expect(result.current.foods).toEqual([]);
    expect(result.current.foodsLoading).toBe(false);
  });
});
