import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useUpdateScheduleItem from '../useUpdateScheduleItem';
import menuScheduleItemApi from '../../api/menuScheduleItemApi';

vi.mock('../../api/menuScheduleItemApi');

const mockSuccess = vi.fn();
const mockError = vi.fn();

vi.mock('antd', () => ({
  App: {
    useApp: () => ({
      message: { success: mockSuccess, error: mockError },
    }),
  },
}));

describe('useUpdateScheduleItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with isSubmitting as false', () => {
    const { result } = renderHook(() => useUpdateScheduleItem());
    expect(result.current.isSubmitting).toBe(false);
  });

  it('should set isSubmitting and call onSuccess when update is successful', async () => {
    menuScheduleItemApi.updateScheduleItem.mockResolvedValueOnce({ success: true, message: 'Item updated successfully' });
    
    const { result } = renderHook(() => useUpdateScheduleItem());
    const mockOnSuccess = vi.fn();
    
    let updatePromise;
    act(() => {
      updatePromise = result.current.updateItem('item1', { maxServing: 20, __v: 0 }, { onSuccess: mockOnSuccess });
    });
    
    expect(result.current.isSubmitting).toBe(true);
    
    await act(async () => {
      await updatePromise;
    });
    
    expect(result.current.isSubmitting).toBe(false);
    expect(mockSuccess).toHaveBeenCalledWith('Item updated successfully');
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('should not show toast when API fails with 409 and instead throw for component handling', async () => {
    const errorResponse = { response: { status: 409, data: { message: 'Data conflict' } } };
    menuScheduleItemApi.updateScheduleItem.mockRejectedValueOnce(errorResponse);
    
    const { result } = renderHook(() => useUpdateScheduleItem());
    
    await act(async () => {
      try {
        await result.current.updateItem('item1', { maxServing: 20, __v: 0 });
      } catch (err) {
        expect(err.response.status).toBe(409);
      }
    });
    
    expect(result.current.isSubmitting).toBe(false);
    expect(mockError).not.toHaveBeenCalled(); // 409 handled by modal in component
  });
});
