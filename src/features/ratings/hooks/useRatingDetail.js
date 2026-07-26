import { useState, useCallback } from 'react';
import ratingApi from '../api/ratingApi';

const useRatingDetail = () => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDetail = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await ratingApi.getRatingById(id);
      if (response && response.data) {
        setDetail(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch rating detail:', err);
      // Determine error message safely
      let errorMsg = 'An error occurred while fetching the detail';
      if (err instanceof Error) {
        errorMsg = err.message;
      } else if (err && err.response && err.response.data && err.response.data.message) {
        errorMsg = err.response.data.message;
      } else if (typeof err === 'string') {
        errorMsg = err;
      }
      
      setError(errorMsg);
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearDetail = useCallback(() => {
    setDetail(null);
    setError(null);
  }, []);

  return {
    detail,
    loading,
    error,
    fetchDetail,
    clearDetail,
  };
};

export default useRatingDetail;
