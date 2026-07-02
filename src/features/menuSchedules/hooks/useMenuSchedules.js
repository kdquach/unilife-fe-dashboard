import { useState, useEffect, useCallback } from 'react';
import menuScheduleApi from '../api/menuScheduleApi';
import { App } from 'antd';

const useMenuSchedules = (initialParams = { page: 1, limit: 10 }) => {
  const { message } = App.useApp();
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState(initialParams);

  const fetchMenuSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const response = await menuScheduleApi.getMenuSchedules(filters);
      if (response.success && response.data) {
        setData(response.data.items || []);
        setPagination(response.data.pagination || { page: 1, limit: 10, total: 0 });
      } else {
        message.error(response.message || 'Failed to fetch menu schedules');
      }
    } catch (error) {
      message.error(error.message || 'An error occurred while fetching menu schedules');
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
    handleTableChange,
    handleFilterChange,
    refresh,
  };
};

export default useMenuSchedules;
