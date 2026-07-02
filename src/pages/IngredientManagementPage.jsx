import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Input,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  DatabaseOutlined,
  EditOutlined,
  EyeOutlined,
  ImportOutlined,
  InboxOutlined,
  PlusOutlined,
  WarningOutlined,
} from "@ant-design/icons";

import PageHeader from "../components/PageHeader";
import IngredientDetailDrawer from "../features/ingredients/IngredientDetailDrawer";
import IngredientFormModal from "../features/ingredients/IngredientFormModal";
import IngredientStockAdjustModal from "../features/ingredients/IngredientStockAdjustModal";
import IngredientStockImportModal from "../features/ingredients/IngredientStockImportModal";
import { ingredientService } from "../features/ingredients/ingredientService";
import { ingredientCategoryService } from "../features/ingredientCategories/ingredientCategoryService";
import { supplierService } from "../features/suppliers/supplierService";
import { formatDateTime } from "../utils/format";

const { Search } = Input;

const getRecordId = (record) => record?._id || record?.id || record?.ingredientId;

const getCategoryName = (category) => {
  if (!category) return "Uncategorized";
  if (typeof category === "string") return category;
  return category.name || category._id || "Uncategorized";
};

const asNumber = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const isLowStock = (record) => {
  const threshold = asNumber(record?.minStockThreshold);
  return threshold > 0 && asNumber(record?.currentStock) <= threshold;
};

export default function IngredientManagementPage() {
  const [ingredients, setIngredients] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [supplierLoading, setSupplierLoading] = useState(false);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [filters, setFilters] = useState({
    categoryId: undefined,
    isActive: undefined,
    storageType: undefined,
  });
  const [sorter, setSorter] = useState({
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [savingIngredient, setSavingIngredient] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importingStock, setImportingStock] = useState(false);
  const [importBatches, setImportBatches] = useState([]);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [adjusting, setAdjusting] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);
  const [adjustBatches, setAdjustBatches] = useState([]);
  const [selectedIngredient, setSelectedIngredient] = useState(null);

  const fetchIngredients = async ({
    page = pagination.current,
    pageSize = pagination.pageSize,
    searchKeyword = keyword,
    nextFilters = filters,
    nextSorter = sorter,
  } = {}) => {
    try {
      setLoading(true);
      setError("");

      const response = await ingredientService.getIngredients({
        page,
        limit: pageSize,
        keyword: searchKeyword || undefined,
        categoryId: nextFilters.categoryId,
        isActive: nextFilters.isActive,
        storageType: nextFilters.storageType,
        sortBy: nextSorter.sortBy,
        sortOrder: nextSorter.sortOrder,
      });

      setIngredients(Array.isArray(response.data) ? response.data : []);
      setPagination({
        current: response.pagination.page || page,
        pageSize: response.pagination.limit || pageSize,
        total: response.pagination.total || 0,
      });
    } catch (err) {
      setIngredients([]);
      setPagination((prev) => ({ ...prev, current: 1, total: 0 }));
      setError(err.message || "Unable to load ingredients");
      message.error(err.message || "Unable to load ingredients");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setCategoryLoading(true);

      const response = await ingredientCategoryService.getIngredientCategories({
        page: 1,
        limit: 100,
        isActive: true,
      });

      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setCategories([]);
      message.warning(err.message || "Unable to load ingredient categories");
    } finally {
      setCategoryLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      setSupplierLoading(true);

      const response = await supplierService.getSuppliers({
        page: 1,
        limit: 100,
        isActive: true,
      });

      setSuppliers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setSuppliers([]);
      message.warning(err.message || "Unable to load suppliers");
    } finally {
      setSupplierLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredients({ page: 1, pageSize: 10 });
    fetchCategories();
    fetchSuppliers();
  }, []);

  const stats = useMemo(() => {
    const active = ingredients.filter((item) => item?.isActive).length;
    const lowStock = ingredients.filter(isLowStock).length;

    return {
      total: pagination.total || ingredients.length,
      active,
      inactive: ingredients.length - active,
      lowStock,
    };
  }, [ingredients, pagination.total]);

  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        label: category.name || "Unnamed Category",
        value: category._id || category.id,
      })).filter((option) => option.value),
    [categories],
  );

  const storageTypeOptions = useMemo(() => {
    const values = new Set(
      ingredients
        .map((item) => item?.storageType)
        .filter(Boolean),
    );

    return Array.from(values).map((value) => ({
      label: value,
      value,
    }));
  }, [ingredients]);

  const handleFilterChange = (key, value) => {
    const nextFilters = {
      ...filters,
      [key]: value,
    };

    setFilters(nextFilters);
    fetchIngredients({
      page: 1,
      pageSize: pagination.pageSize,
      nextFilters,
    });
  };

  const handleTableChange = (nextPagination, _tableFilters, tableSorter) => {
    const nextSorter = {
      sortBy: tableSorter?.field || "createdAt",
      sortOrder: tableSorter?.order === "ascend" ? "asc" : "desc",
    };

    setSorter(nextSorter);
    fetchIngredients({
      page: nextPagination.current,
      pageSize: nextPagination.pageSize,
      nextSorter,
    });
  };

  const openDrawer = (record) => {
    const id = getRecordId(record);

    if (!id) {
      message.warning("Ingredient ID is missing");
      return;
    }

    setSelectedId(id);
    setDrawerOpen(true);
  };

  const openCreateModal = () => {
    setEditingIngredient(null);
    setFormMode("create");
    setFormModalOpen(true);
  };

  const openEditModal = (record) => {
    setEditingIngredient(record);
    setFormMode("edit");
    setFormModalOpen(true);
  };

  const closeFormModal = () => {
    setFormModalOpen(false);
    setEditingIngredient(null);
    setFormMode("create");
  };

  const handleSubmitIngredient = async (values) => {
    setSavingIngredient(true);

    try {
      if (formMode === "create") {
        await ingredientService.createIngredient(values);
        message.success("Ingredient created successfully");
      } else {
        const id = getRecordId(editingIngredient);
        if (!id) throw new Error("Ingredient ID is missing");

        await ingredientService.updateIngredient(id, values);
        message.success("Ingredient updated successfully");
      }

      closeFormModal();
      await fetchIngredients({
        page: formMode === "create" ? 1 : pagination.current,
        pageSize: pagination.pageSize,
      });
    } catch (err) {
      message.error(err.message || "Unable to save ingredient");
    } finally {
      setSavingIngredient(false);
    }
  };

  const openAdjustModal = async (record) => {
    const id = getRecordId(record);

    if (!id) {
      message.warning("Ingredient ID is missing");
      return;
    }

    setSelectedIngredient(record);
    setAdjustModalOpen(true);
    setAdjustBatches([]);

    try {
      setBatchLoading(true);
      const detail = await ingredientService.getIngredientById(id);
      setSelectedIngredient(detail || record);
      setAdjustBatches(Array.isArray(detail?.batches) ? detail.batches : []);
    } catch (err) {
      message.warning(err.message || "Unable to load ingredient batches");
    } finally {
      setBatchLoading(false);
    }
  };

  const openImportModal = async (record) => {
    const id = getRecordId(record);

    if (!id) {
      message.warning("Ingredient ID is missing");
      return;
    }

    setSelectedIngredient(record);
    setImportModalOpen(true);
    setImportBatches([]);

    try {
      setBatchLoading(true);
      const detail = await ingredientService.getIngredientById(id);
      setSelectedIngredient(detail || record);
      setImportBatches(Array.isArray(detail?.batches) ? detail.batches : []);
    } catch (err) {
      message.warning(err.message || "Unable to load ingredient batches");
    } finally {
      setBatchLoading(false);
    }
  };

  const closeImportModal = () => {
    setImportModalOpen(false);
    setSelectedIngredient(null);
    setImportBatches([]);
  };

  const handleRecordStockImport = async (values) => {
    const id = getRecordId(selectedIngredient);

    if (!id) {
      message.warning("Ingredient ID is missing");
      return;
    }

    setImportingStock(true);

    try {
      await ingredientService.recordStockImport(id, {
        quantity: values.quantity,
        expiryDate: values.expiryDate,
        supplierId: values.supplierId,
        unitPrice: values.unitPrice,
        importCode: values.importCode,
        reason: values.reason,
        referenceType: "STOCK_IMPORT",
      });

      message.success("Stock import recorded and transaction history saved");
      closeImportModal();
      await fetchIngredients({
        page: pagination.current,
        pageSize: pagination.pageSize,
      });
    } catch (err) {
      message.error(err.message || "Unable to record stock import");
    } finally {
      setImportingStock(false);
    }
  };

  const closeAdjustModal = () => {
    setAdjustModalOpen(false);
    setSelectedIngredient(null);
    setAdjustBatches([]);
  };

  const handleAdjustStock = async (values) => {
    const id = getRecordId(selectedIngredient);

    if (!id) {
      message.warning("Ingredient ID is missing");
      return;
    }

    setAdjusting(true);

    try {
      if (values.stockBefore === values.stockAfter) {
        throw new Error("Stock adjustment does not change the current stock");
      }

      await ingredientService.adjustIngredientStock(id, {
        adjustmentType: values.adjustmentType,
        quantity: values.quantity,
        stockAfter: values.stockAfter,
        batchId: values.batchId,
        expiryDate: values.expiryDate?.format?.("YYYY-MM-DD"),
        unitPrice: values.unitPrice,
        reason: values.reason.trim(),
        referenceType: "MANUAL_STOCK_ADJUSTMENT",
      });

      message.success("Stock adjusted and transaction history saved");
      closeAdjustModal();
      await fetchIngredients({
        page: pagination.current,
        pageSize: pagination.pageSize,
      });
    } catch (err) {
      message.error(
        err.message ||
          "Stock was not changed because transaction history could not be saved",
      );
    } finally {
      setAdjusting(false);
    }
  };

  const columns = [
    {
      title: "Ingredient",
      dataIndex: "name",
      sorter: true,
      render: (value, record) => (
        <div className="min-w-0">
          <Typography.Text strong className="block">
            {value || "Unnamed Ingredient"}
          </Typography.Text>
          <Typography.Text className="text-xs text-slate-500">
            {getCategoryName(record.categoryId)}
          </Typography.Text>
        </div>
      ),
    },
    {
      title: "Unit",
      dataIndex: "unit",
      width: 110,
      render: (value) => value || "-",
    },
    {
      title: "Storage",
      dataIndex: "storageType",
      width: 140,
      sorter: true,
      render: (value) => value || "-",
    },
    {
      title: "Current Stock",
      dataIndex: "currentStock",
      width: 150,
      sorter: true,
      render: (value, record) => (
        <Space size={6} wrap>
          <Typography.Text>{asNumber(value)}</Typography.Text>
          {isLowStock(record) && (
            <Tag color="warning" icon={<WarningOutlined />}>
              Low
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Threshold",
      dataIndex: "minStockThreshold",
      width: 130,
      sorter: true,
      render: (value) => asNumber(value),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      width: 120,
      render: (value) =>
        value ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>,
    },
    {
      title: "Updated",
      dataIndex: "updatedAt",
      width: 170,
      render: (value) => formatDateTime(value),
    },
    {
      title: "Actions",
      fixed: "right",
      width: 220,
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => openDrawer(record)}
          />
          <Button
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          />
          <Button
            icon={<ImportOutlined />}
            onClick={() => openImportModal(record)}
          />
          <Button
            icon={<DatabaseOutlined />}
            onClick={() => openAdjustModal(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Ingredient Management"
        description="Manage ingredients, details, filters, and stock adjustments"
        breadcrumbs={["Dashboard", "Ingredients"]}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
          >
            Create Ingredient
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="dashboard-card">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-unilife-soft text-xl text-unilife">
              <DatabaseOutlined />
            </div>
            <div>
              <div className="text-sm text-slate-500">Ingredients</div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="text-sm text-slate-500">Active on Page</div>
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
        </Card>

        <Card>
          <div className="text-sm text-slate-500">Inactive on Page</div>
          <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
        </Card>

        <Card>
          <div className="text-sm text-slate-500">Low Stock on Page</div>
          <div className="text-2xl font-bold text-orange-600">
            {stats.lowStock}
          </div>
        </Card>
      </div>

      <Card
        title="Ingredients"
        extra={
          <Space wrap>
            <Search
              placeholder="Search ingredient..."
              allowClear
              style={{ width: 240 }}
              onSearch={(value) => {
                setKeyword(value);
                fetchIngredients({
                  page: 1,
                  pageSize: pagination.pageSize,
                  searchKeyword: value,
                });
              }}
            />
            <Select
              allowClear
              loading={categoryLoading}
              placeholder="Category"
              options={categoryOptions}
              style={{ width: 180 }}
              onChange={(value) => handleFilterChange("categoryId", value)}
            />
            <Select
              allowClear
              placeholder="Storage"
              options={storageTypeOptions}
              style={{ width: 150 }}
              onChange={(value) => handleFilterChange("storageType", value)}
            />
            <Select
              allowClear
              placeholder="Status"
              options={[
                { label: "Active", value: true },
                { label: "Inactive", value: false },
              ]}
              style={{ width: 130 }}
              onChange={(value) => handleFilterChange("isActive", value)}
            />
          </Space>
        }
      >
        {error && (
          <Alert
            className="mb-4"
            type="error"
            showIcon
            message="Ingredients could not be loaded"
            description={error}
          />
        )}

        <Table
          rowKey={(record) => getRecordId(record) || record.name}
          loading={loading}
          dataSource={ingredients}
          columns={columns}
          scroll={{ x: 1100 }}
          locale={{
            emptyText: (
              <div className="py-8">
                <InboxOutlined className="mb-3 text-4xl text-slate-300" />
                <div>No ingredients found</div>
              </div>
            ),
          }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `${total} ingredients`,
          }}
          onChange={handleTableChange}
        />
      </Card>

      <IngredientDetailDrawer
        open={drawerOpen}
        ingredientId={selectedId}
        onClose={() => setDrawerOpen(false)}
      />

      <IngredientFormModal
        open={formModalOpen}
        mode={formMode}
        initialValues={editingIngredient}
        categories={categories}
        categoryLoading={categoryLoading}
        loading={savingIngredient}
        onCancel={closeFormModal}
        onSubmit={handleSubmitIngredient}
      />

      <IngredientStockImportModal
        open={importModalOpen}
        ingredient={selectedIngredient}
        batches={importBatches}
        suppliers={suppliers}
        supplierLoading={supplierLoading || batchLoading}
        loading={importingStock}
        onCancel={closeImportModal}
        onSubmit={handleRecordStockImport}
      />

      <IngredientStockAdjustModal
        open={adjustModalOpen}
        ingredient={selectedIngredient}
        batches={adjustBatches}
        batchLoading={batchLoading}
        loading={adjusting}
        onCancel={closeAdjustModal}
        onSubmit={handleAdjustStock}
      />
    </div>
  );
}
