import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useReplyRating from '../hooks/useReplyRating';
import ratingApi from '../api/ratingApi';
import { message } from 'antd';

vi.mock('../api/ratingApi');
vi.mock('antd', () => {
  const originalModule = vi.importActual('antd');
  return {
    ...originalModule,
    message: {
      success: vi.fn(),
      error: vi.fn(),
    },
  };
});

describe('useReplyRating hook', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should initialize with loading false', () => {
    const { result } = renderHook(() => useReplyRating());
    expect(result.current.loading).toBe(false);
  });

  it('should submit reply successfully', async () => {
    ratingApi.replyRating.mockResolvedValueOnce({ data: { _id: '1' } });
    const onSuccess = vi.fn();

    const { result } = renderHook(() => useReplyRating());

    let response;
    await act(async () => {
      response = await result.current.submitReply('1', 'Thanks!', onSuccess);
    });

    expect(ratingApi.replyRating).toHaveBeenCalledWith('1', { staffReply: 'Thanks!' });
    expect(message.success).toHaveBeenCalledWith('Replied successfully');
    expect(onSuccess).toHaveBeenCalled();
    expect(response).toBe(true);
  });

  it('should handle reply error', async () => {
    ratingApi.replyRating.mockRejectedValueOnce(new Error('Failed to reply'));
    const onSuccess = vi.fn();

    const { result } = renderHook(() => useReplyRating());

    let response;
    await act(async () => {
      response = await result.current.submitReply('1', 'Thanks!', onSuccess);
    });

    expect(ratingApi.replyRating).toHaveBeenCalledWith('1', { staffReply: 'Thanks!' });
    expect(message.error).toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(response).toBe(false);
  });
});
