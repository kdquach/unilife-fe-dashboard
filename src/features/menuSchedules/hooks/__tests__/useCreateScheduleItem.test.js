import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useCreateScheduleItem from '../useCreateScheduleItem';
import menuScheduleItemApi from '../../api/menuScheduleItemApi';
import { notify } from '../../../../utils/notify';

vi.mock('../../api/menuScheduleItemApi');
vi.mock('../../../../utils/notify', () => ({
  notify: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

describe('useCreateScheduleItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with isSubmitting as false', () => {
    const { result } = renderHook(() => useCreateScheduleItem());
    expect(result.current.isSubmitting).toBe(false);
  });

  it('should set isSubmitting and call onSuccess when creation is successful', async () => {
    menuScheduleItemApi.createScheduleItem.mockResolvedValueOnce({ success: true, message: 'Item added successfully' });
    
    const { result } = renderHook(() => useCreateScheduleItem());
    const mockOnSuccess = vi.fn();
    
    let createPromise;
    act(() => {
      createPromise = result.current.createItem({ menuScheduleId: '1', foodId: 'f1', maxServing: 10 }, { onSuccess: mockOnSuccess });
    });
    
    expect(result.current.isSubmitting).toBe(true);
    
    await act(async () => {
      await createPromise;
    });
    
    expect(result.current.isSubmitting).toBe(false);
    expect(notify.success).toHaveBeenCalledWith('Item added successfully', 'Item added successfully');
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('should handle error when API fails with 400', async () => {
    const errorResponse = { response: { status: 400, data: { message: 'Insufficient ingredients in stock' } } };
    menuScheduleItemApi.createScheduleItem.mockRejectedValueOnce(errorResponse);
    
    const { result } = renderHook(() => useCreateScheduleItem());
    
    await act(async () => {
      try {
        await result.current.createItem({ menuScheduleId: '1', foodId: 'f1', maxServing: 10 });
      } catch {
        // caught by caller
      }
    });
    
    expect(result.current.isSubmitting).toBe(false);
  });
});
