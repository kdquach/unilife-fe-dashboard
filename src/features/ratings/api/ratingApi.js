import apiClient from '../../../services/apiClient';

const getRatings = async (params = {}) => {
  return await apiClient.get('/ratings', { params });
};

const getRatingById = async (id) => {
  return await apiClient.get(`/ratings/${id}`);
};

export default {
  getRatings,
  getRatingById,
};
