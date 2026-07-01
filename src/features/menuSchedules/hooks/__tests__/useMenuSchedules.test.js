import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useMenuSchedules from '../useMenuSchedules';
import menuScheduleApi from '../../api/menuScheduleApi';

vi.mock('../../api/menuScheduleApi');

describe('useMenuSchedules', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch menu schedules on mount', async () => {
    const mockData = {
      success: true,
      data: {
        items: [{ _id: '1', date: '2026-06-25T00:00:00.000Z', status: 'PUBLISHED' }],
        pagination: { page: 1, limit: 10, total: 1 }
      }
    };
    menuScheduleApi.getMenuSchedules.mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useMenuSchedules());

    expect(result.current.loading).toBe(true);

    // Wait for effect to resolve
    await vi.waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(menuScheduleApi.getMenuSchedules).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
    });
    expect(result.current.data).toEqual(mockData.data.items);
    expect(result.current.pagination.total).toBe(1);
  });

  it('should handle filter changes', async () => {
    const mockData = {
      success: true,
      data: {
        items: [],
        pagination: { page: 1, limit: 10, total: 0 }
      }
    };
    menuScheduleApi.getMenuSchedules.mockResolvedValue(mockData);

    const { result } = renderHook(() => useMenuSchedules());

    await vi.waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.handleFilterChange({ status: ['PUBLISHED'], dateFrom: '2026-06-01' });
    });

    await vi.waitFor(() => {
      expect(menuScheduleApi.getMenuSchedules).toHaveBeenLastCalledWith(
        expect.objectContaining({
          status: ['PUBLISHED'],
          dateFrom: '2026-06-01',
          page: 1, // should reset to page 1 on filter change
        })
      );
    });
  });
});
