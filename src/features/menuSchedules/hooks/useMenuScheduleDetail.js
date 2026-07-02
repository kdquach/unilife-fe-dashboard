import { useState, useCallback } from 'react';
import menuScheduleApi from '../api/menuScheduleApi';
import { App } from 'antd';

const useMenuScheduleDetail = () => {
  const { message } = App.useApp();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDetail = useCallback(async (id, includeInactive = false) => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await menuScheduleApi.getMenuScheduleDetail(id, { includeInactive });
      if (response.success && response.data) {
        setDetail(response.data);
      } else {
        const errorMsg = response.message || 'Failed to fetch menu schedule detail';
        setError(errorMsg);
        message.error(errorMsg);
      }
    } catch (err) {
      const errorMsg = err.message || 'An error occurred while fetching details';
      setError(errorMsg);
      message.error(errorMsg);
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
