import { useState } from "react";
import { supplierService } from "../supplierService";
import { notify } from "../../../utils/notify";

/**
 * Hook to manage suppliers
 */
export function useSuppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchSuppliers = async (
    page = pagination.current,
    pageSize = pagination.pageSize,
    searchKeyword = "",
    filters = {},
  ) => {
    try {
      setLoading(true);

      const response = await supplierService.getSuppliers({
        page,
        limit: pageSize,
        keyword: searchKeyword,
        ...filters,
      });

      setSuppliers(response.data);
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

  const createSupplier = async (values) => {
    try {
      setSaving(true);
      await supplierService.createSupplier(values);
      notify.success("Supplier created successfully");
    } catch (error) {
      notify.error(error.message);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const updateSupplier = async (id, values) => {
    try {
      setSaving(true);
      await supplierService.updateSupplier(id, values);
      notify.success("Supplier updated successfully");
    } catch (error) {
      notify.error(error.message);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const deleteSupplier = async (id) => {
    try {
      setDeleting(id);
      await supplierService.deleteSupplier(id);
      notify.success("Supplier deleted successfully");
    } catch (error) {
      notify.error(error.message);
      throw error;
    } finally {
      setDeleting(null);
    }
  };

  const getSupplierById = async (id) => {
    try {
      return await supplierService.getSupplierById(id);
    } catch (error) {
      notify.error(error.message);
      throw error;
    }
  };

  return {
    suppliers,
    loading,
    saving,
    deleting,
    pagination,
    fetchSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    getSupplierById,
  };
}
