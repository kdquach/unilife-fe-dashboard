import React, { useEffect, useMemo, useState } from "react";
import {
  AppstoreOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Descriptions,
  Drawer,
  Image,
  Input,
  Select,
  Space,
  Spin,
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
import { ingredientService } from "../features/ingredients/ingredientService";
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

const getIngredientName = (ingredient) => {
  if (!ingredient) return "-";
  if (typeof ingredient === "string") return ingredient;
  return ingredient.name || "-";
};

const resolveImageUrl = (imageUrl) => {
  if (!imageUrl) return imageNotFound;
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  return `${assetBaseUrl}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
};

export default function FoodManagementPage() {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [ingredientLoading, setIngredientLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [editingFood, setEditingFood] = useState(null);
  const [selectedFood, setSelectedFood] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
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

  const fetchIngredients = async () => {
    try {
      setIngredientLoading(true);
      const response = await ingredientService.getIngredients({
        page: 1,
        limit: 100,
        isActive: true,
      });

      setIngredients(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setIngredients([]);
      message.warning(error.message || "Unable to load ingredients");
    } finally {
      setIngredientLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods({ page: 1, pageSize: 10 });
    fetchCategories();
    fetchIngredients();
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

  const fetchFoodDetail = async (record) => {
    const id = getRecordId(record);
    if (!id) throw new Error("Food ID is missing");

    return foodService.getManagedFoodById(id);
  };

  const openDetailDrawer = async (record) => {
    setSelectedFood(record);
    setDetailOpen(true);
    setDetailLoading(true);

    try {
      const detail = await fetchFoodDetail(record);
      setSelectedFood(detail);
    } catch (error) {
      message.error(error.message || "Unable to load food detail");
    } finally {
      setDetailLoading(false);
    }
  };

  const openEditModal = async (record) => {
    const id = getRecordId(record);

    try {
      setActionLoadingId(id);
      const detail = await fetchFoodDetail(record);
      setEditingFood(detail);
      setFormMode("edit");
      setFormOpen(true);
    } catch (error) {
      message.error(error.message || "Unable to load food detail");
    } finally {
      setActionLoadingId(null);
    }
  };

  const closeFormModal = () => {
    setFormOpen(false);
    setEditingFood(null);
    setFormMode("create");
  };

  const handleSubmitFood = async (values) => {
    setSaving(true);

    try {
      let savedFood;
      if (formMode === "create") {
        savedFood = await foodService.createFood(values);
        message.success("Food created successfully");
      } else {
        const id = getRecordId(editingFood);
        if (!id) throw new Error("Food ID is missing");

        savedFood = await foodService.updateFood(id, values);
        message.success("Food updated successfully");
      }

      if (detailOpen && getRecordId(selectedFood) === getRecordId(savedFood)) {
        setSelectedFood(savedFood);
      }

      closeFormModal();
      await fetchFoods({
        page: formMode === "create" ? 1 : pagination.current,
        pageSize: pagination.pageSize,
      });
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
      title: "Recipe",
      dataIndex: "ingredients",
      width: 120,
      render: (value = []) => (
        <Tag color={value.length > 0 ? "green" : "default"}>
          {value.length} items
        </Tag>
      ),
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
      width: 130,
      render: (_, record) => (
        <Space size={6}>
          <Button
            icon={<EyeOutlined />}
            title="View Food Detail"
            onClick={() => openDetailDrawer(record)}
          />
          <Button
            icon={<EditOutlined />}
            title="Update Food"
            loading={actionLoadingId === getRecordId(record)}
            onClick={() => openEditModal(record)}
          />
        </Space>
      ),
    },
  ];

  const recipeColumns = [
    {
      title: "Ingredient",
      render: (_, record) => getIngredientName(record.ingredientId),
    },
    {
      title: "Quantity",
      dataIndex: "quantityPerServing",
      width: 130,
      render: (value) => value || "-",
    },
    {
      title: "Unit",
      dataIndex: "unit",
      width: 100,
      render: (value, record) => value || record.ingredientId?.unit || "-",
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

      <Drawer
        title="Food Details"
        placement="right"
        width={620}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      >
        <Spin spinning={detailLoading}>
          {selectedFood && (
            <div>
              <div className="mb-5 flex items-center gap-4">
                <Image
                  src={resolveImageUrl(selectedFood.imageUrl)}
                  fallback={imageNotFound}
                  alt={selectedFood.name || "Food"}
                  width={104}
                  height={104}
                  className="rounded-md object-cover"
                  preview={Boolean(selectedFood.imageUrl)}
                />
                <div>
                  <Typography.Title level={4} className="!mb-1">
                    {selectedFood.name || "Unnamed Food"}
                  </Typography.Title>
                  <Typography.Text className="text-slate-500">
                    {getCategoryName(selectedFood.categoryId)}
                  </Typography.Text>
                </div>
              </div>

              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="Price">
                  {formatCurrency(selectedFood.price)}
                </Descriptions.Item>
                <Descriptions.Item label="Type">
                  {selectedFood.isMenuItem ? (
                    <Tag color="purple">Menu item</Tag>
                  ) : (
                    <Tag color="blue">Daily</Tag>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Daily Stock">
                  {selectedFood.stockQuantity === null ||
                  selectedFood.stockQuantity === undefined
                    ? "-"
                    : selectedFood.stockQuantity}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  {selectedFood.isActive ? (
                    <Tag color="green">Active</Tag>
                  ) : (
                    <Tag color="red">Inactive</Tag>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Description">
                  {selectedFood.description || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Created">
                  {formatDateTime(selectedFood.createdAt)}
                </Descriptions.Item>
                <Descriptions.Item label="Updated">
                  {formatDateTime(selectedFood.updatedAt)}
                </Descriptions.Item>
              </Descriptions>

              <Typography.Title level={5} className="!mb-3 !mt-6">
                Recipe Ingredients
              </Typography.Title>
              <Table
                rowKey={(record) => record._id || record.ingredientId?._id}
                size="small"
                pagination={false}
                columns={recipeColumns}
                dataSource={selectedFood.ingredients || []}
              />
            </div>
          )}
        </Spin>
      </Drawer>

      <FoodFormModal
        open={formOpen}
        mode={formMode}
        initialValues={editingFood}
        categories={categories}
        ingredients={ingredients}
        categoryLoading={categoryLoading}
        ingredientLoading={ingredientLoading}
        loading={saving}
        getImageUrl={resolveImageUrl}
        onCancel={closeFormModal}
        onSubmit={handleSubmitFood}
      />
    </div>
  );
}
