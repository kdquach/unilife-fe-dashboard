import { useState, useEffect, useCallback } from 'react';
import ratingApi from '../api/ratingApi';

const useRatings = () => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({});

  const fetchRatings = useCallback(async (page = 1, pageSize = 10, currentFilters = {}) => {
    setLoading(true);
    try {
      const response = await ratingApi.getRatings({
        page,
        limit: pageSize,
        ...currentFilters
      });
      
      if (response && response.data) {
        setRatings(response.data.items || []);
        setPagination({
          current: response.data.pagination?.page || page,
          pageSize: response.data.pagination?.limit || pageSize,
          total: response.data.pagination?.total || 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch ratings:', error);
      setRatings([]);
      setPagination(prev => ({ ...prev, total: 0 }));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRatings(1, 10, filters);
  }, [fetchRatings, filters]);

  const handleTableChange = (newPagination) => {
    fetchRatings(newPagination.current, newPagination.pageSize, filters);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    // fetchRatings is automatically triggered via useEffect when filters change, 
    // and we want it to default back to page 1.
    // However, since we depend on the useEffect, changing filters will trigger fetchRatings(1, 10, newFilters).
  };

  return {
    ratings,
    loading,
    pagination,
    filters,
    handleTableChange,
    handleFilterChange,
    refresh: () => fetchRatings(pagination.current, pagination.pageSize, filters)
  };
};

export default useRatings;
