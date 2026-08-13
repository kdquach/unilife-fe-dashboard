import { useState, useCallback } from 'react';
import menuScheduleApi from '../api/menuScheduleApi';
import { notify } from '../../../utils/notify';

const useMenuScheduleDetail = () => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDetail = useCallback(async (id, includeInactive = false) => {
    if (!id) return;
    
    console.log('fetchDetail called with id:', id, 'includeInactive:', includeInactive);
    setLoading(true);
    setError(null);
    try {
      const response = await menuScheduleApi.getMenuScheduleDetail(id, { includeInactive });
      console.log('fetchDetail response:', response);
      if (response.success && response.data) {
        setDetail(response.data);
      } else {
        const errorMsg = response.message || 'Failed to fetch menu schedule detail';
        setError(errorMsg);
        notify.error('Failed to fetch menu schedule detail', errorMsg);
      }
    } catch (err) {
      console.error('fetchDetail error:', err);
      const errorMsg = err.message || err.response?.data?.message || 'An error occurred while fetching details';
      setError(errorMsg);
      notify.error('An error occurred while fetching details', errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const resetDetail = useCallback(() => {
    setDetail(null);
    setError(null);
  }, []);

  return {
    detail,
    loading,
    error,
    fetchDetail,
    resetDetail,
  };
};

export default useMenuScheduleDetail;
