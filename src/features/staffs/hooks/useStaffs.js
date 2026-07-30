import { useState } from "react";
import { staffService } from "../staffService";
import { notify } from "../../../utils/notify";

/**
 * Hook to manage staff
 */
export function useStaffs() {
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchStaffs = async (
    page = pagination.current,
    pageSize = pagination.pageSize,
    searchKeyword = "",
    filters = {},
  ) => {
    try {
      setLoading(true);

      const response = await staffService.getStaffs({
        page,
        limit: pageSize,
        keyword: searchKeyword || undefined,
        ...filters,
      });

      setStaffs(response.data);
      setPagination({
        current: response.pagination.page,
        pageSize: response.pagination.limit,
        total: response.pagination.total,
      });
    } catch (error) {
      notify.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStaff = async (id, values) => {
    try {
      setSaving(true);
      await staffService.updateStaff(id, values);
      notify.success("Staff updated successfully");
    } catch (error) {
      notify.error(error.message);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const getStaffById = async (id) => {
    try {
      return await staffService.getStaffById(id);
    } catch (error) {
      notify.error(error.message);
      throw error;
    }
  };

  return {
    staffs,
    loading,
    saving,
    pagination,
    fetchStaffs,
    updateStaff,
    getStaffById,
  };
}
