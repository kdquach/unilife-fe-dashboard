import { useState } from "react";
import { userService } from "../userService";
import { notify } from "../../../utils/notify";

/**
 * Hook to manage users
 */
export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingRoleId, setChangingRoleId] = useState(null);
  
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchUsers = async (
    page = pagination.current,
    pageSize = pagination.pageSize,
    searchKeyword = "",
    filters = {},
  ) => {
    try {
      setLoading(true);

      const response = await userService.getUsers({
        page,
        limit: pageSize,
        keyword: searchKeyword,
        ...filters,
      });

      setUsers(response.data);
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

  const createUser = async (values) => {
    try {
      setSaving(true);
      await userService.createUser(values);
      notify.success("User created successfully");
    } catch (error) {
      notify.error(error.message);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const updateUser = async (id, values) => {
    try {
      setSaving(true);
      await userService.updateUser(id, values);
      notify.success("User updated successfully");
    } catch (error) {
      notify.error(error.message);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const changeUserRole = async (id, role) => {
    try {
      setChangingRoleId(id);
      await userService.updateUserRole(id, role);
      notify.success("User role changed successfully");
    } catch (error) {
      notify.error(error.message);
      throw error;
    } finally {
      setChangingRoleId(null);
    }
  };

  const getUserById = async (id) => {
    try {
      return await userService.getUserById(id);
    } catch (error) {
      notify.error(error.message);
      throw error;
    }
  };

  return {
    users,
    loading,
    saving,
    changingRoleId,
    pagination,
    fetchUsers,
    createUser,
    updateUser,
    changeUserRole,
    getUserById,
  };
}
