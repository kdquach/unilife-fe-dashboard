import React, { useState, useEffect } from "react";
import { Button, Card, Input, Select, Space } from "antd";
import { PlusOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import PageHeader from "../components/PageHeader";
import { COLORS } from "../features/orders/utils/orderUtils.jsx";

// Components
import FoodCategorySummaryCards from "../features/foodCategories/components/FoodCategorySummaryCards";
import FoodCategoryTable from "../features/foodCategories/components/FoodCategoryTable";
import FoodCategoryDetailDrawer from "../features/foodCategories/components/FoodCategoryDetailDrawer";
import FoodCategoryFormModal from "../features/foodCategories/FoodCategoryFormModal";

// Hooks
import { useFoodCategories } from "../features/foodCategories/hooks/useFoodCategories";

const { Search } = Input;

const statusOptions = [
  { label: "Active", value: "true" },
  { label: "Inactive", value: "false" },
];

export default function FoodCategoryManagementPage() {
  // Local state for modals and selection
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [keyword, setKeyword] = useState("");
  const [filters, setFilters] = useState({ isActive: undefined });

  // Custom hook
  const {
    categories,
    loading,
    saving,
    pagination,
    fetchCategories,
    createCategory,
    updateCategory,
    getCategoryById,
  } = useFoodCategories();

  // Initial data fetch
  useEffect(() => {
    fetchCategories(1, 10);
  }, []);

  // Handlers
  const handleSearch = (value) => {
    setKeyword(value);
    fetchCategories(1, pagination.pageSize, value, filters);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchCategories(1, pagination.pageSize, keyword, newFilters);
  };

  const handlePaginationChange = (pager) => {
    fetchCategories(pager.current, pager.pageSize, keyword, filters);
  };

  const handleViewDetail = async (category) => {
    setSelectedCategory(category);
    setDetailOpen(true);
    setDetailLoading(true);

    try {
      const data = await getCategoryById(category._id);
      setSelectedCategory(data);
    } catch (error) {
      console.error(error);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setFormMode("edit");
    setFormOpen(true);
  };

  const handleCreate = () => {
    setSelectedCategory(null);
    setFormMode("create");
    setFormOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (formMode === "create") {
        await createCategory(values);
      } else {
        await updateCategory(selectedCategory._id, values);
      }

      setFormOpen(false);
      setSelectedCategory(null);

      await fetchCategories(
        formMode === "create" ? 1 : pagination.current,
        pagination.pageSize,
        keyword,
        filters,
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <PageHeader
        title="Food Categories"
        breadcrumbs={["Dashboard", "Food Categories"]}
        extra={
          <Space wrap>
            <Button
              icon={<ReloadOutlined />}
              onClick={() =>
                fetchCategories(
                  pagination.current,
                  pagination.pageSize,
                  keyword,
                  filters,
                )
              }
            >
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Create Category
            </Button>
          </Space>
        }
      />

      <FoodCategorySummaryCards categories={categories} />

      <Card
        title="Categories"
        style={{ borderRadius: 14, boxShadow: "0 2px 10px rgba(20, 20, 43, 0.05)" }}
        extra={
          <Space wrap>
            <Search
              allowClear
              enterButton={<SearchOutlined />}
              placeholder="Search category..."
              style={{ width: 260 }}
              onSearch={handleSearch}
            />
            <Select
              allowClear
              placeholder="Status"
              style={{ width: 150 }}
              options={statusOptions}
              onChange={(value) => handleFilterChange("isActive", value)}
            />
          </Space>
        }
      >
        <FoodCategoryTable
          categories={categories}
          loading={loading}
          pagination={pagination}
          onViewDetail={handleViewDetail}
          onEdit={handleEdit}
          onPaginationChange={handlePaginationChange}
        />
      </Card>

      <FoodCategoryDetailDrawer
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        selectedCategory={selectedCategory}
        loading={detailLoading}
      />

      <FoodCategoryFormModal
        open={formOpen}
        mode={formMode}
        initialValues={formMode === "edit" ? selectedCategory : null}
        loading={saving}
        onCancel={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
