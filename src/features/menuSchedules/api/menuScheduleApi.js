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

const menuScheduleApi = {
  getMenuSchedules,
  getMenuScheduleDetail,
};

export default menuScheduleApi;
