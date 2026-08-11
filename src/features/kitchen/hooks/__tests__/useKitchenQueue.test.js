import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useKitchenQueue } from "../useKitchenQueue";
import { queueService } from "../../../queues/queueService";
import { notify } from "../../../../utils/notify";

vi.mock("../../../queues/queueService");
vi.mock("../../../../utils/notify", () => ({
  notify: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

describe("useKitchenQueue hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default states", () => {
    const { result } = renderHook(() => useKitchenQueue());

    expect(result.current.currentServing).toBeNull();
    expect(result.current.waitingQueues).toEqual([]);
    expect(result.current.summary).toEqual({});
    expect(result.current.loading).toBe(false);
    expect(result.current.callingNext).toBe(false);
  });

  it("should fetch monitor queue and update states", async () => {
    const mockData = {
      currentServing: { queueNumber: 5, orderCode: "UN005" },
      waiting: [{ queueNumber: 6, orderCode: "UN006" }],
      summary: { totalWaiting: 1 },
      pagination: { page: 1, limit: 10, total: 1 },
    };
    queueService.getMonitorQueue.mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useKitchenQueue());

    await act(async () => {
      await result.current.fetchMonitorQueue(1, 10, "", {}, false);
    });

    expect(result.current.currentServing).toEqual(mockData.currentServing);
    expect(result.current.waitingQueues).toEqual(mockData.waiting);
    expect(result.current.summary).toEqual(mockData.summary);
    expect(result.current.loading).toBe(false);
  });

  it("should support silent background polling without setting loading state", async () => {
    const mockData = {
      currentServing: { queueNumber: 8 },
      waiting: [],
      summary: {},
      pagination: { page: 1, limit: 10, total: 0 },
    };
    queueService.getMonitorQueue.mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useKitchenQueue());

    await act(async () => {
      await result.current.fetchMonitorQueue(1, 10, "", {}, true);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.currentServing).toEqual(mockData.currentServing);
  });

  it("should call next queue number and trigger refetch", async () => {
    queueService.callNextNumber.mockResolvedValueOnce({ success: true });
    queueService.getMonitorQueue.mockResolvedValueOnce({
      currentServing: { queueNumber: 6 },
      waiting: [],
      summary: {},
      pagination: { page: 1, limit: 10, total: 0 },
    });

    const { result } = renderHook(() => useKitchenQueue());

    await act(async () => {
      await result.current.callNextQueue();
    });

    expect(queueService.callNextNumber).toHaveBeenCalled();
    expect(notify.success).toHaveBeenCalledWith("Next queue called successfully");
    expect(queueService.getMonitorQueue).toHaveBeenCalled();
  });
});
