import { useState, useEffect, useCallback } from 'react';
import menuScheduleApi from '../api/menuScheduleApi';
import { notify } from '../../../utils/notify';

const useMenuSchedules = (initialParams = { page: 1, limit: 10 }) => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialParams);

  const fetchMenuSchedules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await menuScheduleApi.getMenuSchedules(filters);
      if (response.success && response.data) {
        setData(response.data.items || []);
        setPagination(response.data.pagination || { page: 1, limit: 10, total: 0 });
      } else {
        const errorMsg = response.message || 'Failed to fetch menu schedules';
        setError(errorMsg);
        notify.error('Failed to fetch menu schedules', errorMsg);
      }
    } catch (error) {
      console.error('Error fetching menu schedules:', error);
      const errorMsg = error.message || error.response?.data?.message || 'An error occurred while fetching menu schedules';
      setError(errorMsg);
      notify.error('An error occurred while fetching menu schedules', errorMsg);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchMenuSchedules();
  }, [fetchMenuSchedules]);

  const handleTableChange = (newPagination) => {
    setFilters((prev) => ({
      ...prev,
      page: newPagination.current,
      limit: newPagination.pageSize,
    }));
  };

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1, // reset page to 1 when filters change
    }));
  };

  const refresh = () => {
    fetchMenuSchedules();
  };

  return {
    data,
    loading,
    pagination,
    filters,
    error,
    handleTableChange,
    handleFilterChange,
    refresh,
  };
};

export default useMenuSchedules;
