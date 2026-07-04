import { describe, it, expect, vi, beforeEach } from 'vitest';
import menuScheduleApi from '../menuScheduleApi';
import apiClient from '@/services/apiClient';

vi.mock('@/services/apiClient');

describe('menuScheduleApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMenuSchedules', () => {
    it('should fetch menu schedules with correctly formatted params', async () => {
      const mockResponse = { success: true, data: { items: [], pagination: {} } };
      apiClient.get.mockResolvedValueOnce(mockResponse);

      const params = { page: 1, limit: 10, status: ['DRAFT', 'PUBLISHED'], date: '2026-06-25' };
      const response = await menuScheduleApi.getMenuSchedules(params);

      expect(apiClient.get).toHaveBeenCalledWith('/menu-schedules/staff', {
        params: {
          page: 1,
          limit: 10,
          status: 'DRAFT,PUBLISHED', // Array of status joined by comma
          date: '2026-06-25'
        }
      });
      expect(response).toEqual(mockResponse);
    });

    it('should omit undefined params', async () => {
      const mockResponse = { success: true };
      apiClient.get.mockResolvedValueOnce(mockResponse);

      const params = { page: 1, limit: 10, status: undefined };
      const response = await menuScheduleApi.getMenuSchedules(params);

      expect(apiClient.get).toHaveBeenCalledWith('/menu-schedules/staff', {
        params: {
          page: 1,
          limit: 10
        }
      });
      expect(response).toEqual(mockResponse);
    });
  });

  describe('getMenuScheduleDetail', () => {
    it('should fetch menu schedule detail by id', async () => {
      const mockResponse = { success: true, data: { _id: '1' } };
      apiClient.get.mockResolvedValueOnce(mockResponse);

      const id = '1';
      const params = { includeInactive: true };
      const response = await menuScheduleApi.getMenuScheduleDetail(id, params);

      expect(apiClient.get).toHaveBeenCalledWith(`/menu-schedules/staff/${id}`, {
        params: {
          includeInactive: true
        }
      });
      expect(response).toEqual(mockResponse);
    });
  });
});
