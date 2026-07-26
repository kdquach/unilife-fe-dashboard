import { describe, it, expect, vi, beforeEach } from 'vitest';
import menuScheduleItemApi from '../menuScheduleItemApi';
import apiClient from '@/services/apiClient';

vi.mock('@/services/apiClient');

describe('menuScheduleItemApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createScheduleItem', () => {
    it('should create a new schedule item via POST', async () => {
      const mockResponse = { success: true, data: { _id: 'item1' } };
      apiClient.post.mockResolvedValueOnce(mockResponse);

      const payload = { menuScheduleId: 'sch1', foodId: 'food1', maxServing: 50 };
      const response = await menuScheduleItemApi.createScheduleItem(payload);

      expect(apiClient.post).toHaveBeenCalledWith('/menu-schedule-items', payload);
      expect(response).toEqual(mockResponse);
    });
  });

  describe('updateScheduleItem', () => {
    it('should update schedule item via PATCH with __v', async () => {
      const mockResponse = { success: true, data: { maxServing: 80 } };
      apiClient.patch.mockResolvedValueOnce(mockResponse);

      const id = 'item1';
      const payload = { maxServing: 80, __v: 0 };
      const response = await menuScheduleItemApi.updateScheduleItem(id, payload);

      expect(apiClient.patch).toHaveBeenCalledWith(`/menu-schedule-items/${id}`, payload);
      expect(response).toEqual(mockResponse);
    });

    it('should soft-delete schedule item via PATCH with isActive: false and __v', async () => {
      const mockResponse = { success: true, data: { isActive: false } };
      apiClient.patch.mockResolvedValueOnce(mockResponse);

      const id = 'item1';
      const payload = { isActive: false, __v: 1 };
      const response = await menuScheduleItemApi.updateScheduleItem(id, payload);

      expect(apiClient.patch).toHaveBeenCalledWith(`/menu-schedule-items/${id}`, payload);
      expect(response).toEqual(mockResponse);
    });
  });
});
