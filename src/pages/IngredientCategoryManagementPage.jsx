import React, { useEffect, useMemo, useState } from "react";
import { Card, Table, Tag, Input, Button, Space } from "antd";
import { notify } from "../utils/notify";
import {
  PlusOutlined,
  AppstoreOutlined,
  EyeOutlined,
  EditOutlined,
} from "@ant-design/icons";

import PageHeader from "../components/PageHeader";
import { ingredientCategoryService } from "../features/ingredientCategories/ingredientCategoryService";
import IngredientCategoryDetailDrawer from "../features/ingredientCategories/IngredientCategoryDetailDrawer";
import IngredientCategoryFormModal from "../features/ingredientCategories/IngredientCategoryFormModal";

const { Search } = Input;

export default function IngredientCategoryManagementPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [keyword, setKeyword] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create | edit
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [saving, setSaving] = useState(false);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // ================= FETCH =================
  const fetchCategories = async (
    page = pagination.current,
    pageSize = pagination.pageSize,
    searchKeyword = keyword
  ) => {
    try {
      setLoading(true);

      const response =
        await ingredientCategoryService.getIngredientCategories({
          page,
          limit: pageSize,
          keyword: searchKeyword,
        });

      setCategories(response.data);

      setPagination({
        current: response.pagination.page,
        pageSize: response.pagination.limit,
        total: response.pagination.total,
      });
    } catch (err) {
      notify.error(err.message || "Fetch failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(1, 10);
  }, []);

  // ================= STATS =================
  const stats = useMemo(() => {
    const active = categories.filter((item) => item.isActive).length;

    return {
      active,
      inactive: categories.length - active,
    };
  }, [categories]);

  // ================= DRAWER =================
  const openDrawer = (id) => {
    setSelectedId(id);
    setDrawerOpen(true);
  };

  // ================= CREATE =================
  const openCreateModal = () => {
    setSelectedCategory(null);
    setModalMode("create");
    setModalOpen(true);
  };

  // ================= EDIT =================
  const openEditModal = (category) => {
    setSelectedCategory(category);
    setModalMode("edit");
    setModalOpen(true);
  };

  // ================= CLOSE MODAL =================
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedCategory(null);
    setModalMode("create");
  };

  // ================= SUBMIT (CREATE + UPDATE) =================
  const handleSubmitCategory = async (values) => {
    setSaving(true);

    try {
      if (modalMode === "create") {
        await ingredientCategoryService.createIngredientCategory(values);
        notify.success("Category created successfully");
      }

      if (modalMode === "edit") {
        await ingredientCategoryService.updateIngredientCategory(
          selectedCategory._id,
          values
        );
        notify.success("Category updated successfully");
      }

      handleCloseModal();

      await fetchCategories(
        pagination.current,
        pagination.pageSize,
        keyword
      );
    } catch (err) {
      notify.error(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  // ================= TABLE =================
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
    {
  title: "Actions",
  fixed: "right",
  width: 140,
  render: (_, record) => (
    <Space>
      <Button
        icon={<EyeOutlined />}
        onClick={() => openDrawer(record._id)}
      />

      <Button
        icon={<EditOutlined />}
        onClick={() => openEditModal(record)}
      />
    </Space>
  ),
},
  ];

  return (
    <div>
      {/* HEADER */}
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

      {/* STATS */}
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="dashboard-card">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-unilife-soft text-xl text-unilife">
              <AppstoreOutlined />
            </div>

            <div>
              <div className="text-sm text-slate-500">Categories</div>
              <div className="text-2xl font-bold">
                {categories.length}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="text-sm text-slate-500">Active</div>
          <div className="text-2xl font-bold text-green-600">
            {stats.active}
          </div>
        </Card>

        <Card>
          <div className="text-sm text-slate-500">Inactive</div>
          <div className="text-2xl font-bold text-red-600">
            {stats.inactive}
          </div>
        </Card>
      </div>

      {/* TABLE */}
      <Card
        title="Ingredient Categories"
        extra={
          <Search
            placeholder="Search category..."
            allowClear
            style={{ width: 250 }}
            onSearch={(value) => {
              setKeyword(value);
              fetchCategories(1, pagination.pageSize, value);
            }}
          />
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
            onChange: (page, pageSize) =>
              fetchCategories(page, pageSize, keyword),
          }}
        />
      </Card>

      {/* DRAWER */}
      <IngredientCategoryDetailDrawer
        open={drawerOpen}
        categoryId={selectedId}
        onClose={() => setDrawerOpen(false)}
      />

      {/* MODAL */}
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