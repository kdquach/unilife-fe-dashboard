import apiClient from '../../../services/apiClient';

const getRatings = async (params = {}) => {
  return await apiClient.get('/ratings', { params });
};

const getRatingById = async (id) => {
  return await apiClient.get(`/ratings/${id}`);
};

const replyRating = async (id, payload) => {
  return await apiClient.patch(`/ratings/${id}/reply`, payload);
};

export default {
  getRatings,
  getRatingById,
  replyRating,
};
