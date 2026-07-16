import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useRatingDetail from '../hooks/useRatingDetail';
import ratingApi from '../api/ratingApi';

vi.mock('../api/ratingApi');

describe('useRatingDetail hook', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useRatingDetail());
    expect(result.current.loading).toBe(false);
    expect(result.current.detail).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should fetch rating detail successfully', async () => {
    const mockDetail = { _id: '1', stars: 5 };
    ratingApi.getRatingById.mockResolvedValueOnce({ data: mockDetail });

    const { result } = renderHook(() => useRatingDetail());

    act(() => {
      result.current.fetchDetail('1');
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();

    await vi.waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(ratingApi.getRatingById).toHaveBeenCalledWith('1');
    expect(result.current.detail).toEqual(mockDetail);
    expect(result.current.error).toBeNull();
  });

  it('should handle fetch error', async () => {
    ratingApi.getRatingById.mockRejectedValueOnce(new Error('Not found'));

    const { result } = renderHook(() => useRatingDetail());

    act(() => {
      result.current.fetchDetail('1');
    });

    await vi.waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.detail).toBeNull();
    expect(result.current.error).toBe('Not found');
  });

  it('should clear detail', () => {
    const { result } = renderHook(() => useRatingDetail());
    
    act(() => {
      result.current.clearDetail();
    });

    expect(result.current.detail).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
