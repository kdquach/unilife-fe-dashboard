import React, { useState, useEffect } from "react";
import { Card, Table, Tag, Input, Button, Space } from "antd";
import { PlusOutlined, AppstoreOutlined, SearchOutlined } from "@ant-design/icons";
import PageHeader from "../components/PageHeader";
import { COLORS } from "../features/orders/utils/orderUtils.jsx";

// Components
import IngredientCategoryDetailDrawer from "../features/ingredientCategories/IngredientCategoryDetailDrawer";
import IngredientCategoryFormModal from "../features/ingredientCategories/IngredientCategoryFormModal";

// Hooks
import { useIngredientCategories } from "../features/ingredientCategories/hooks/useIngredientCategories";

const { Search } = Input;

export default function IngredientCategoryManagementPage() {
  // Local state for modals and selection
  const [keyword, setKeyword] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Custom hook
  const { categories, loading, saving, pagination, fetchCategories, createCategory, updateCategory } = useIngredientCategories();

  // Initial data fetch
  useEffect(() => {
    fetchCategories(1, 10);
  }, []);

  const stats = {
    active: categories.filter((item) => item.isActive).length,
    inactive: categories.length - categories.filter((item) => item.isActive).length,
  };

  const handleSearch = (value) => {
    setKeyword(value);
    fetchCategories(1, pagination.pageSize, value);
  };

  const handlePaginationChange = (page, pageSize) => {
    fetchCategories(page, pageSize, keyword);
  };

  const openDrawer = (id) => {
    setSelectedId(id);
    setDrawerOpen(true);
  };

  const openCreateModal = () => {
    setSelectedCategory(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const openEditModal = (category) => {
    setSelectedCategory(category);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedCategory(null);
    setModalMode("create");
  };

  const handleSubmitCategory = async (values) => {
    try {
      if (modalMode === "create") {
        await createCategory(values);
      } else {
        await updateCategory(selectedCategory._id, values);
      }

      handleCloseModal();
      await fetchCategories(pagination.current, pagination.pageSize, keyword);
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    {
      title: "Category Name",
      dataIndex: "name",
    },
    {
      title: "Status",
      dataIndex: "isActive",
      render: (value) =>
        value ? (
          <Tag color="green">Active</Tag>
        ) : (
          <Tag color="red">Inactive</Tag>
        ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      render: (value) => new Date(value).toLocaleString("vi-VN"),
    },
    {
      title: "Updated",
      dataIndex: "updatedAt",
      render: (value) => new Date(value).toLocaleString("vi-VN"),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Ingredient Categories"
        description="Manage ingredient categories"
        breadcrumbs={["Dashboard", "Ingredient Categories"]}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
          >
            Create Category
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
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
              <div className="text-sm text-slate-500">Categories</div>
              <div className="mt-1 text-2xl font-bold" style={{ color: COLORS.orange }}>
                {categories.length}
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
              <AppstoreOutlined />
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
              <div className="text-sm text-slate-500">Active</div>
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
              ✓
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
              <div className="text-sm text-slate-500">Inactive</div>
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
              ✗
            </div>
          </div>
        </Card>
      </div>

      <Card
        title="Ingredient Categories"
        style={{ borderRadius: 14, boxShadow: "0 2px 10px rgba(20, 20, 43, 0.05)" }}
        extra={
          <Space wrap>
            <Search
              placeholder="Search category..."
              allowClear
              enterButton={<SearchOutlined />}
              style={{ width: 260 }}
              onSearch={handleSearch}
            />
          </Space>
        }
      >
        <Table
          rowKey="_id"
          loading={loading}
          dataSource={categories}
          columns={columns}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `${total} categories`,
            onChange: handlePaginationChange,
          }}
        />
      </Card>

      <IngredientCategoryDetailDrawer
        open={drawerOpen}
        categoryId={selectedId}
        onClose={() => setDrawerOpen(false)}
      />

      <IngredientCategoryFormModal
        open={modalOpen}
        mode={modalMode}
        initialValues={selectedCategory}
        loading={saving}
        onCancel={handleCloseModal}
        onSubmit={handleSubmitCategory}
      />
    </div>
  );
}