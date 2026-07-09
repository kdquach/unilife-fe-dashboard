import React, { useEffect, useMemo, useState } from "react";
import {
  AppstoreOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Image,
  Input,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import PageHeader from "../components/PageHeader";
import imageNotFound from "../assets/image-not-found.png";
import FoodFormModal from "../features/foods/FoodFormModal";
import { foodService } from "../features/foods/foodService";
import { foodCategoryService } from "../features/foodCategories/foodCategoryService";
import { formatDateTime } from "../utils/format";

const { Search } = Input;

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
const assetBaseUrl = apiBaseUrl.replace(/\/api\/v1\/?$/, "");

const formatCurrency = (value) =>
  `${Number(value || 0).toLocaleString("vi-VN")} VND`;

const getRecordId = (record) => record?._id || record?.id || record?.foodId;

const getCategoryName = (category) => {
  if (!category) return "Uncategorized";
  if (typeof category === "string") return category;
  return category.name || "Uncategorized";
};

const resolveImageUrl = (imageUrl) => {
  if (!imageUrl) return imageNotFound;
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  return `${assetBaseUrl}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
};

export default function FoodManagementPage() {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [editingFood, setEditingFood] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [filters, setFilters] = useState({
    categoryId: undefined,
    isActive: undefined,
    kind: undefined,
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchFoods = async ({
    page = pagination.current,
    pageSize = pagination.pageSize,
    searchKeyword = keyword,
    nextFilters = filters,
  } = {}) => {
    try {
      setLoading(true);
      const response = await foodService.getManagedFoods({
        page,
        limit: pageSize,
        keyword: searchKeyword || undefined,
        categoryId: nextFilters.categoryId,
        isActive: nextFilters.isActive,
        kind: nextFilters.kind,
      });

      setFoods(Array.isArray(response.data) ? response.data : []);
      setPagination({
        current: response.pagination.page || page,
        pageSize: response.pagination.limit || pageSize,
        total: response.pagination.total || 0,
      });
    } catch (error) {
      setFoods([]);
      message.error(error.message || "Unable to load foods");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setCategoryLoading(true);
      const response = await foodCategoryService.getFoodCategories({
        page: 1,
        limit: 100,
        isActive: true,
      });

      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setCategories([]);
      message.warning(error.message || "Unable to load food categories");
    } finally {
      setCategoryLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods({ page: 1, pageSize: 10 });
    fetchCategories();
  }, []);

  const stats = useMemo(() => {
    const active = foods.filter((food) => food?.isActive).length;
    const menuItems = foods.filter((food) => food?.isMenuItem).length;

    return {
      total: pagination.total || foods.length,
      active,
      inactive: foods.length - active,
      menuItems,
    };
  }, [foods, pagination.total]);

  const categoryOptions = useMemo(
    () =>
      categories
        .map((category) => ({
          label: category.name || "Unnamed Category",
          value: category._id || category.id,
        }))
        .filter((option) => option.value),
    [categories],
  );

  const handleFilterChange = (key, value) => {
    const nextFilters = { ...filters, [key]: value };
    setFilters(nextFilters);
    fetchFoods({ page: 1, pageSize: pagination.pageSize, nextFilters });
  };

  const openCreateModal = () => {
    setEditingFood(null);
    setFormMode("create");
    setFormOpen(true);
  };

  const closeFormModal = () => {
    setFormOpen(false);
    setEditingFood(null);
    setFormMode("create");
  };

  const handleSubmitFood = async (values) => {
    setSaving(true);

    try {
      await foodService.createFood(values);
      message.success("Food created successfully");
      closeFormModal();
      await fetchFoods({ page: 1, pageSize: pagination.pageSize });
    } catch (error) {
      message.error(error.message || "Unable to save food");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      title: "Food",
      dataIndex: "name",
      render: (value, record) => (
        <div className="flex min-w-[260px] items-center gap-3">
          <Image
            src={resolveImageUrl(record.imageUrl)}
            fallback={imageNotFound}
            alt={value || "Food"}
            width={64}
            height={64}
            className="rounded-md object-cover"
            preview={Boolean(record.imageUrl)}
          />
          <div className="min-w-0">
            <Typography.Text strong className="block">
              {value || "Unnamed Food"}
            </Typography.Text>
            <Typography.Text className="text-xs text-slate-500">
              {getCategoryName(record.categoryId)}
            </Typography.Text>
          </div>
        </div>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      width: 150,
      render: formatCurrency,
    },
    {
      title: "Type",
      dataIndex: "isMenuItem",
      width: 150,
      render: (value) =>
        value ? <Tag color="purple">Menu item</Tag> : <Tag color="blue">Daily</Tag>,
    },
    {
      title: "Stock",
      dataIndex: "stockQuantity",
      width: 120,
      render: (value) => (value === null || value === undefined ? "-" : value),
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
      render: formatDateTime,
    },
    {
      title: "Actions",
      fixed: "right",
      width: 90,
      render: () => (
        <Button icon={<EditOutlined />} disabled title="Update Food" />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Foods"
        description="Manage food items sold by UniLife."
        breadcrumbs={["Dashboard", "Foods"]}
        extra={
          <Space wrap>
            <Button
              icon={<ReloadOutlined />}
              onClick={() =>
                fetchFoods({
                  page: pagination.current,
                  pageSize: pagination.pageSize,
                })
              }
            >
              Refresh
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              Create Food
            </Button>
          </Space>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="dashboard-card">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-unilife-soft text-xl text-unilife">
              <AppstoreOutlined />
            </div>
            <div>
              <div className="text-sm text-slate-500">Foods</div>
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
          <div className="text-sm text-slate-500">Menu Items on Page</div>
          <div className="text-2xl font-bold text-purple-600">
            {stats.menuItems}
          </div>
        </Card>
      </div>

      <Card
        title="Food Items"
        extra={
          <Space wrap>
            <Search
              placeholder="Search food..."
              allowClear
              style={{ width: 240 }}
              onSearch={(value) => {
                setKeyword(value);
                fetchFoods({
                  page: 1,
                  pageSize: pagination.pageSize,
                  searchKeyword: value,
                });
              }}
            />
            <Select
              allowClear
              showSearch
              loading={categoryLoading}
              placeholder="Category"
              options={categoryOptions}
              optionFilterProp="label"
              style={{ width: 190 }}
              onChange={(value) => handleFilterChange("categoryId", value)}
            />
            <Select
              allowClear
              placeholder="Type"
              style={{ width: 150 }}
              options={[
                { label: "Daily", value: "alwaysAvailable" },
                { label: "Menu item", value: "menuItem" },
              ]}
              onChange={(value) => handleFilterChange("kind", value)}
            />
            <Select
              allowClear
              placeholder="Status"
              style={{ width: 130 }}
              options={[
                { label: "Active", value: true },
                { label: "Inactive", value: false },
              ]}
              onChange={(value) => handleFilterChange("isActive", value)}
            />
          </Space>
        }
      >
        <Table
          rowKey={(record) => getRecordId(record) || record.name}
          loading={loading}
          dataSource={foods}
          columns={columns}
          scroll={{ x: 1050 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `${total} foods`,
          }}
          onChange={(nextPagination) =>
            fetchFoods({
              page: nextPagination.current,
              pageSize: nextPagination.pageSize,
            })
          }
        />
      </Card>

      <FoodFormModal
        open={formOpen}
        mode={formMode}
        initialValues={editingFood}
        categories={categories}
        categoryLoading={categoryLoading}
        loading={saving}
        onCancel={closeFormModal}
        onSubmit={handleSubmitFood}
      />
    </div>
  );
}
