import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useCreateMenuSchedule from '../useCreateMenuSchedule';
import menuScheduleApi from '../../api/menuScheduleApi';
import { notify } from '../../../../utils/notify';

vi.mock('../../api/menuScheduleApi');
vi.mock('../../../../utils/notify', () => ({
  notify: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

describe('useCreateMenuSchedule', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with isSubmitting as false', () => {
    const { result } = renderHook(() => useCreateMenuSchedule());
    expect(result.current.isSubmitting).toBe(false);
  });

  it('should set isSubmitting to true during creation and false after', async () => {
    menuScheduleApi.createMenuSchedule.mockResolvedValueOnce({ success: true, message: 'Created' });
    
    const { result } = renderHook(() => useCreateMenuSchedule());
    
    let createPromise;
    act(() => {
      createPromise = result.current.createSchedule({ date: '2026-07-20T00:00:00.000Z' });
    });
    
    expect(result.current.isSubmitting).toBe(true);
    
    await act(async () => {
      await createPromise;
    });
    
    expect(result.current.isSubmitting).toBe(false);
    expect(notify.success).toHaveBeenCalledWith('Menu schedule created successfully', 'Created');
  });

  it('should handle error when API fails', async () => {
    menuScheduleApi.createMenuSchedule.mockResolvedValueOnce({ success: false, message: 'Creation failed' });
    
    const { result } = renderHook(() => useCreateMenuSchedule());
    
    await act(async () => {
      await result.current.createSchedule({ date: '2026-07-20T00:00:00.000Z' });
    });
    
    expect(result.current.isSubmitting).toBe(false);
    expect(notify.error).toHaveBeenCalledWith('Failed to create menu schedule', 'Creation failed');
  });
});
