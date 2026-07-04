import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useMenuScheduleDetail from '../useMenuScheduleDetail';
import menuScheduleApi from '../../api/menuScheduleApi';

vi.mock('../../api/menuScheduleApi');

describe('useMenuScheduleDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch detail when an id is provided', async () => {
    const mockData = {
      success: true,
      data: {
        _id: '1',
        items: []
      }
    };
    menuScheduleApi.getMenuScheduleDetail.mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useMenuScheduleDetail());

    act(() => {
      result.current.fetchDetail('1');
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);

    await vi.waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(menuScheduleApi.getMenuScheduleDetail).toHaveBeenCalledWith('1', { includeInactive: false });
    expect(result.current.detail).toEqual(mockData.data);
  });

  it('should handle API error', async () => {
    menuScheduleApi.getMenuScheduleDetail.mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(() => useMenuScheduleDetail());

    act(() => {
      result.current.fetchDetail('2');
    });

    await vi.waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('API Error');
    expect(result.current.detail).toBe(null);
  });
});
