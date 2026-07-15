import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useRatings from '../hooks/useRatings';
import ratingApi from '../api/ratingApi';

// Mock the API
vi.mock('../api/ratingApi');

describe('useRatings hook', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useRatings());
    expect(result.current.loading).toBe(true);
    expect(result.current.ratings).toEqual([]);
    expect(result.current.pagination).toEqual({ current: 1, pageSize: 10, total: 0 });
  });

  it('should fetch ratings successfully', async () => {
    const mockData = {
      items: [{ _id: '1', ratingType: 'FOOD', stars: 5 }],
      pagination: { currentPage: 1, limit: 10, totalItems: 1 }
    };
    ratingApi.getRatings.mockResolvedValueOnce({ data: mockData });

    const { result } = renderHook(() => useRatings());

    // Wait for the hook to finish loading
    await vi.waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(ratingApi.getRatings).toHaveBeenCalledWith(expect.objectContaining({ page: 1, limit: 10 }));
    expect(result.current.ratings).toEqual(mockData.items);
    expect(result.current.pagination.total).toBe(1);
  });

  it('should handle pagination changes', async () => {
    ratingApi.getRatings.mockResolvedValue({ data: { items: [], pagination: { currentPage: 2, limit: 10, totalItems: 20 } } });

    const { result } = renderHook(() => useRatings());
    
    await vi.waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.handleTableChange({ current: 2, pageSize: 10 });
    });

    await vi.waitFor(() => {
      expect(ratingApi.getRatings).toHaveBeenCalledWith(expect.objectContaining({ page: 2, limit: 10 }));
    });
  });

  it('should apply filters and reset to page 1', async () => {
    ratingApi.getRatings.mockResolvedValue({ data: { items: [], pagination: { currentPage: 1, limit: 10, totalItems: 0 } } });

    const { result } = renderHook(() => useRatings());
    
    await vi.waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.handleFilterChange({ type: 'FOOD', stars: 5 });
    });

    await vi.waitFor(() => {
      expect(ratingApi.getRatings).toHaveBeenCalledWith(expect.objectContaining({ type: 'FOOD', stars: 5, page: 1 }));
    });
  });
});
