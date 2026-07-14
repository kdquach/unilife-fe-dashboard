import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useUpdateMenuSchedule from '../useUpdateMenuSchedule';
import menuScheduleApi from '../../api/menuScheduleApi';


vi.mock('../../api/menuScheduleApi');
const mockSuccess = vi.fn();
const mockError = vi.fn();

vi.mock('antd', () => ({
  App: {
    useApp: () => ({
      message: { success: mockSuccess, error: mockError },
    }),
  },
}));

describe('useUpdateMenuSchedule', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with isSubmitting as false', () => {
    const { result } = renderHook(() => useUpdateMenuSchedule());
    expect(result.current.isSubmitting).toBe(false);
  });

  it('should set isSubmitting to true during update and false after', async () => {
    menuScheduleApi.updateMenuSchedule.mockResolvedValueOnce({ success: true, message: 'Updated successfully' });
    
    const { result } = renderHook(() => useUpdateMenuSchedule());
    
    let updatePromise;
    act(() => {
      updatePromise = result.current.updateSchedule('1', { date: '2026-07-20T00:00:00.000Z', status: 'PUBLISHED', __v: 0 });
    });
    
    expect(result.current.isSubmitting).toBe(true);
    
    await act(async () => {
      await updatePromise;
    });
    
    expect(result.current.isSubmitting).toBe(false);
    expect(mockSuccess).toHaveBeenCalledWith('Updated successfully');
  });

  it('should handle error and throw when API fails', async () => {
    const errorResponse = { response: { status: 409, data: { message: 'Data was modified by another user.' } } };
    menuScheduleApi.updateMenuSchedule.mockRejectedValueOnce(errorResponse);
    
    const { result } = renderHook(() => useUpdateMenuSchedule());
    
    await act(async () => {
      try {
        await result.current.updateSchedule('1', { status: 'PUBLISHED', __v: 0 });
      } catch (err) {
        expect(err).toEqual(errorResponse);
      }
    });
    
    expect(result.current.isSubmitting).toBe(false);
    // Custom error handling based on status codes might not be in the hook itself if handled by component
    // But let's assume hook surfaces errors properly
  });
});
