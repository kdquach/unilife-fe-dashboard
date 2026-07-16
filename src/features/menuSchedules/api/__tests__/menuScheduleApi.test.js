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

  describe('createMenuSchedule', () => {
    it('should create a new menu schedule via POST', async () => {
      const mockResponse = { success: true, data: { _id: '1' } };
      apiClient.post.mockResolvedValueOnce(mockResponse);

      const payload = { date: '2026-07-20T00:00:00.000Z', status: 'DRAFT' };
      const response = await menuScheduleApi.createMenuSchedule(payload);

      expect(apiClient.post).toHaveBeenCalledWith('/menu-schedules', payload);
      expect(response).toEqual(mockResponse);
    });
  });

  describe('updateMenuSchedule', () => {
    it('should update menu schedule via PATCH with __v', async () => {
      const mockResponse = { success: true };
      apiClient.patch.mockResolvedValueOnce(mockResponse);

      const id = '1';
      const payload = { date: '2026-07-20T00:00:00.000Z', status: 'PUBLISHED', __v: 0 };
      const response = await menuScheduleApi.updateMenuSchedule(id, payload);

      expect(apiClient.patch).toHaveBeenCalledWith(`/menu-schedules/${id}`, payload);
      expect(response).toEqual(mockResponse);
    });
  });
});
