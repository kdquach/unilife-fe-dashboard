import apiClient from '../../../services/apiClient';

const getRatings = async (params = {}) => {
  const response = await apiClient.get('/ratings', { params });
  return response.data; // Note: using response.data to get the full wrapper with { success, message, data: { items, pagination } }
};

export default {
  getRatings,
};
