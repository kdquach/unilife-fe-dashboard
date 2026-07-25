import apiClient from '@/services/apiClient';

const getMenuSchedules = async (params = {}) => {
  const { status, ...rest } = params;
  
  const queryParams = { ...rest };
  
  if (status && Array.isArray(status) && status.length > 0) {
    queryParams.status = status.join(',');
  } else if (status && typeof status === 'string') {
    queryParams.status = status;
  }

  // Remove undefined or null values
  Object.keys(queryParams).forEach(key => {
    if (queryParams[key] === undefined || queryParams[key] === null || queryParams[key] === '') {
      delete queryParams[key];
    }
  });

  const response = await apiClient.get('/menu-schedules/staff', {
    params: queryParams,
  });

  return response;
};

const getMenuScheduleDetail = async (id, params = {}) => {
  // Remove undefined or null values
  const queryParams = { ...params };
  Object.keys(queryParams).forEach(key => {
    if (queryParams[key] === undefined || queryParams[key] === null || queryParams[key] === '') {
      delete queryParams[key];
    }
  });

  const response = await apiClient.get(`/menu-schedules/staff/${id}`, {
    params: queryParams,
  });

  return response;
};


const getTodayMenuSchedule = async () => {
  const response = await apiClient.get(
    '/menu-schedules/today'
  );

  return response;
};


const createMenuSchedule = async (data) => {
  const response = await apiClient.post('/menu-schedules', data);
  return response;
};

const updateMenuSchedule = async (id, data) => {
  const response = await apiClient.patch(`/menu-schedules/${id}`, data);
  return response;
};

const menuScheduleApi = {
  getMenuSchedules,
  getMenuScheduleDetail,
  getTodayMenuSchedule,
  createMenuSchedule,
  updateMenuSchedule,
};

export default menuScheduleApi;
