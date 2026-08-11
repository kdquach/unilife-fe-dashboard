import { useState } from "react";
import { orderService } from "../orderService";

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchOrders = async (
    page = pagination.current,
    limit = pagination.pageSize,
    searchKeyword = "",
    filters = {},
    isSilent = false,
  ) => {
    try {
      if (!isSilent) setLoading(true);

      const response = await orderService.getOrders({
        page,
        limit,
        keyword: searchKeyword,
        ...filters,
      });

      setOrders(response?.data || []);

      if (response?.pagination) {
        setPagination({
          current: response.pagination.page || page,
          pageSize: response.pagination.limit || limit,
          total: response.pagination.total || 0,
        });
      }
    } catch (error) {
      if (!isSilent) console.error(error);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  return {
    orders,
    loading,
    pagination,
    fetchOrders,
  };
}
