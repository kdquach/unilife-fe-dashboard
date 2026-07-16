import apiClient from '@/services/apiClient';

const createScheduleItem = async (data) => {
  const response = await apiClient.post('/menu-schedule-items', data);
  return response;
};

const updateScheduleItem = async (id, data) => {
  const response = await apiClient.patch(`/menu-schedule-items/${id}`, data);
  return response;
};

const menuScheduleItemApi = {
  createScheduleItem,
  updateScheduleItem,
};

export default menuScheduleItemApi;
