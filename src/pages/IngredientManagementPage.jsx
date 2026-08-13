import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import {
  DatabaseOutlined,
  EditOutlined,
  EyeOutlined,
  ImportOutlined,
  InboxOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  DeleteOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  StopOutlined 
} from "@ant-design/icons";

import PageHeader from "../components/PageHeader";
import { COLORS } from "../features/orders/utils/orderUtils.jsx";
import { notify } from "../utils/notify";

// Components
import IngredientDetailDrawer from "../features/ingredients/IngredientDetailDrawer";
import IngredientFormModal from "../features/ingredients/IngredientFormModal";
import IngredientStockAdjustModal from "../features/ingredients/IngredientStockAdjustModal";
import IngredientStockImportModal from "../features/ingredients/IngredientStockImportModal";
import {
  STORAGE_TYPE_OPTIONS,
  formatStorageType,
} from "../features/ingredients/ingredientConstants";

// Hooks
import { useIngredients } from "../features/ingredients/hooks/useIngredients";

// Services
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
  // Local state for modals and selection
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [supplierLoading, setSupplierLoading] = useState(false);
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importingStock, setImportingStock] = useState(false);
  const [importBatches, setImportBatches] = useState([]);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [adjusting, setAdjusting] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);
  const [adjustBatches, setAdjustBatches] = useState([]);
  const [selectedIngredient, setSelectedIngredient] = useState(null);

  // Custom hook
  const { ingredients, loading, saving, pagination, fetchIngredients, createIngredient, updateIngredient, deleteIngredient } = useIngredients();

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
      notify.warning("Unable to load ingredient categories", err.message);
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
      notify.warning("Unable to load suppliers", err.message);
    } finally {
      setSupplierLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredients(1, 10, "", filters, sorter);
    fetchCategories();
    fetchSuppliers();
  }, []);

  const stats = {
    total: pagination.total || ingredients.length,
    active: ingredients.filter((item) => item?.isActive).length,
    inactive: ingredients.length - ingredients.filter((item) => item?.isActive).length,
    lowStock: ingredients.filter(isLowStock).length,
  };

  const categoryOptions = categories.map((category) => ({
    label: category.name || "Unnamed Category",
    value: category._id || category.id,
  })).filter((option) => option.value);

  const handleFilterChange = (key, value) => {
    const nextFilters = { ...filters, [key]: value };
    setFilters(nextFilters);
    fetchIngredients(1, pagination.pageSize, keyword, nextFilters, sorter);
  };

  const handleTableChange = (nextPagination, _tableFilters, tableSorter) => {
    const nextSorter = {
      sortBy: tableSorter?.field || "createdAt",
      sortOrder: tableSorter?.order === "ascend" ? "asc" : "desc",
    };

    setSorter(nextSorter);
    fetchIngredients(nextPagination.current, nextPagination.pageSize, keyword, filters, nextSorter);
  };

  const openDrawer = (record) => {
    const id = getRecordId(record);

    if (!id) {
      notify.warning("Ingredient ID is missing");
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
    try {
      if (formMode === "create") {
        await createIngredient(values);
      } else {
        const id = getRecordId(editingIngredient);
        if (!id) throw new Error("Ingredient ID is missing");
        await updateIngredient(id, values);
      }

      closeFormModal();
      await fetchIngredients(formMode === "create" ? 1 : pagination.current, pagination.pageSize, keyword, filters, sorter);
    } catch (err) {
      console.error(err.message || "Unable to save ingredient");
    }
  };

  const deleteIngredientAndRefresh = async (id) => {
    await deleteIngredient(id);
    await fetchIngredients(pagination.current, pagination.pageSize, keyword, filters, sorter);
  };

  const confirmDeleteIngredient = async (record) => {
    const id = getRecordId(record);
    if (!id) {
      notify.warning("Ingredient ID is missing");
      return;
    }

    try {
      const impact = await ingredientService.getDeleteImpact(id);
      const affectedFoods = Array.isArray(impact?.affectedFoods)
        ? impact.affectedFoods
        : [];
      const previewFoods = affectedFoods.slice(0, 5);
      const remainingCount = Math.max(affectedFoods.length - previewFoods.length, 0);

      Modal.confirm({
        title: `Delete ${record?.name || "ingredient"}?`,
        width: 560,
        okText: "Delete",
        okButtonProps: { danger: true },
        cancelText: "Cancel",
        content: (
          <div className="space-y-3">
            <Typography.Text>
              This ingredient will be marked as deleted and hidden from the
              ingredient list.
            </Typography.Text>
            {affectedFoods.length > 0 && (
              <div>
                <Typography.Text strong type="warning">
                  It is used in {affectedFoods.length} food recipe
                  {affectedFoods.length > 1 ? "s" : ""}. Those foods cannot be
                  added to menus until their recipes are updated.
                </Typography.Text>
                <ul className="mt-2 max-h-40 list-disc overflow-auto pl-5">
                  {previewFoods.map((food) => (
                    <li key={food.foodId || food._id}>
                      <Typography.Text>
                        {food.name}
                        {food.recipeUsageCount > 1
                          ? ` (${food.recipeUsageCount} recipe lines)`
                          : ""}
                      </Typography.Text>
                    </li>
                  ))}
                </ul>
                {remainingCount > 0 && (
                  <Typography.Text type="secondary">
                    + {remainingCount} more food{remainingCount > 1 ? "s" : ""}
                  </Typography.Text>
                )}
              </div>
            )}
          </div>
        ),
        onOk: () => deleteIngredientAndRefresh(id),
      });
    } catch (err) {
      notify.error(err.message || "Cannot check ingredient delete impact");
    }
  };

  const openAdjustModal = async (record) => {
    const id = getRecordId(record);

    if (!id) {
      notify.warning("Ingredient ID is missing");
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
      notify.warning("Unable to load ingredient batches", err.message);
    } finally {
      setBatchLoading(false);
    }
  };

  const openImportModal = async (record) => {
    const id = getRecordId(record);

    if (!id) {
      notify.warning("Ingredient ID is missing");
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
      notify.warning("Unable to load ingredient batches", err.message);
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
      console.error("Ingredient ID is missing");
      return;
    }

    setImportingStock(true);

    try {
      await ingredientService.recordStockImport(id, {
        quantity: values.quantity,
        expiryDate: values.expiryDate,
        supplierId: values.supplierId,
        unitPrice: values.unitPrice,
        reason: values.reason,
        referenceType: "STOCK_IMPORT",
      });

      closeImportModal();
      await fetchIngredients(pagination.current, pagination.pageSize, keyword, filters, sorter);
    } catch (err) {
      console.error(err.message || "Unable to record stock import");
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
      console.error("Ingredient ID is missing");
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
        reason: values.reason.trim(),
        referenceType: "MANUAL_STOCK_ADJUSTMENT",
      });

      closeAdjustModal();
      await fetchIngredients(pagination.current, pagination.pageSize, keyword, filters, sorter);
    } catch (err) {
      console.error(err.message || "Stock was not changed because transaction history could not be saved");
    } finally {
      setAdjusting(false);
    }
  };

  const columns = [
    {
      title: "Ingredient",
      dataIndex: "name",
      width: 260,
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
      render: (value) => formatStorageType(value),
    },
    {
      title: "Current Stock",
      dataIndex: "currentStock",
      width: 150,
      sorter: true,
      render: (value, record) => (
        <Space size={6} wrap>
          <Typography.Text>{asNumber(value).toFixed(1)}</Typography.Text>
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
          {!record?.isDeleted && (
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => confirmDeleteIngredient(record)}
            />
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Ingredient Management"
        breadcrumbs={["Dashboard", "Ingredients"]}
        extra={
          <Space wrap>
            <Button
              icon={<ReloadOutlined />}
              loading={loading}
              onClick={() =>
                fetchIngredients(pagination.current, pagination.pageSize, keyword, filters, sorter)
              }
            >
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateModal}
            >
              Create Ingredient
            </Button>
          </Space>
        }
      />

        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card
            className="dashboard-card"
            styles={{ body: { padding: "16px 18px" } }}
            style={{
              borderRadius: 14,
              borderTop: `3px solid ${COLORS.orange}`,
              boxShadow: "0 2px 10px rgba(20, 20, 43, 0.05)",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-500">Ingredients</div>
                <div className="mt-1 text-2xl font-bold" style={{ color: COLORS.orange }}>
                  {stats.total}
                </div>
              </div>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: `${COLORS.orange}1a`,
                  color: COLORS.orange,
                  fontSize: 18,
                }}
              >
                <DatabaseOutlined />
              </div>
            </div>
          </Card>

          <Card
            className="dashboard-card"
            styles={{ body: { padding: "16px 18px" } }}
            style={{
              borderRadius: 14,
              borderTop: `3px solid ${COLORS.green}`,
              boxShadow: "0 2px 10px rgba(20, 20, 43, 0.05)",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-500">Active on Page</div>
                <div className="mt-1 text-2xl font-bold" style={{ color: COLORS.green }}>
                  {stats.active}
                </div>
              </div>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: `${COLORS.green}1a`,
                  color: COLORS.green,
                  fontSize: 18,
                }}
              >
                <CheckCircleOutlined />
              </div>
            </div>
          </Card>

          <Card
            className="dashboard-card"
            styles={{ body: { padding: "16px 18px" } }}
            style={{
              borderRadius: 14,
              borderTop: `3px solid ${COLORS.red}`,
              boxShadow: "0 2px 10px rgba(20, 20, 43, 0.05)",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-500">Inactive on Page</div>
                <div className="mt-1 text-2xl font-bold" style={{ color: COLORS.red }}>
                  {stats.inactive}
                </div>
              </div>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: `${COLORS.red}1a`,
                  color: COLORS.red,
                  fontSize: 18,
                }}
              >
                <StopOutlined />
              </div>
            </div>
          </Card>

          <Card
            className="dashboard-card"
            styles={{ body: { padding: "16px 18px" } }}
            style={{
              borderRadius: 14,
              borderTop: `3px solid ${COLORS.orange}`,
              boxShadow: "0 2px 10px rgba(20, 20, 43, 0.05)",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-500">Low Stock on Page</div>
                <div className="mt-1 text-2xl font-bold" style={{ color: COLORS.orange }}>
                  {stats.lowStock}
                </div>
              </div>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: `${COLORS.orange}1a`,
                  color: COLORS.orange,
                  fontSize: 18,
                }}
              >
                <WarningOutlined />
              </div>
            </div>
          </Card>
        </div>

        <Card
          title="Ingredients"
          style={{ borderRadius: 14, boxShadow: "0 2px 10px rgba(20, 20, 43, 0.05)" }}
          extra={
            <Space wrap>
              <Search
                placeholder="Search ingredient..."
                allowClear
                enterButton={<SearchOutlined />}
                style={{ width: 280 }}
                onSearch={(value) => {
                  setKeyword(value);
                  fetchIngredients(1, pagination.pageSize, value, filters, sorter);
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
                options={STORAGE_TYPE_OPTIONS}
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
          <Table
            rowKey={(record) => getRecordId(record) || record.name}
            loading={loading}
            dataSource={ingredients}
            columns={columns}
            scroll={{ x: 1250 }}
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
          loading={saving}
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
