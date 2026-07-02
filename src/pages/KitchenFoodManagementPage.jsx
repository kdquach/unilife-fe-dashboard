import React, { useEffect, useMemo, useState } from "react";
import {
  CoffeeOutlined,
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Descriptions,
  Drawer,
  Input,
  InputNumber,
  Select,
  Space,
  Spin,
  Table,
  Tag,
} from "antd";
import PageHeader from "../components/PageHeader";
import { foodService } from "../features/foods/foodService";
import { formatDateTime } from "../utils/format";
import { notify } from "../utils/notify";

const formatCurrency = (value) =>
  `${Number(value || 0).toLocaleString("vi-VN")} VND`;

const { Search } = Input;

const hasActiveFilters = (filters) =>
  Object.values(filters).some(
    (value) => value !== undefined && value !== null && value !== "",
  );

const renderFoodType = (isMenuItem) => (
  <Tag color={isMenuItem ? "purple" : "blue"}>
    {isMenuItem ? "Menu Item" : "Always Available"}
  </Tag>
);

export default function KitchenFoodManagementPage() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    kindOptions: [],
  });
  const [filters, setFilters] = useState({
    categoryId: undefined,
    kind: undefined,
    minPrice: undefined,
    maxPrice: undefined,
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchFoods = async (
    page = pagination.current,
    limit = pagination.pageSize,
    searchKeyword = keyword,
    currentFilters = filters,
  ) => {
    try {
      setLoading(true);

      const params = {
        page,
        limit,
        keyword: searchKeyword || undefined,
        ...currentFilters,
      };
      const response = hasActiveFilters(currentFilters)
        ? await foodService.filterKitchenFoods(params)
        : searchKeyword
          ? await foodService.searchKitchenFoods(params)
          : await foodService.getKitchenFoods(params);

      setFoods(response.data);
      setPagination({
        current: response.pagination.page,
        pageSize: response.pagination.limit,
        total: response.pagination.total,
      });
    } catch (error) {
      notify.error("Kitchen Foods Load Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods(1, 10);
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const data = await foodService.getKitchenFoodFilterOptions();
      setFilterOptions({
        categories: data.categories || [],
        kindOptions: data.kindOptions || [],
      });
    } catch (error) {
      notify.error("Kitchen Food Filters Load Failed", error.message);
    }
  };

  const stats = useMemo(() => {
    const menuItems = foods.filter((food) => food.isMenuItem).length;

    return {
      total: foods.length,
      menuItems,
      alwaysAvailable: foods.length - menuItems,
    };
  }, [foods]);

  const openDetailDrawer = async (food) => {
    setSelectedFood(food);
    setDetailOpen(true);
    setDetailLoading(true);

    try {
      const data = await foodService.getKitchenFoodById(food._id);
      setSelectedFood(data);
    } catch (error) {
      notify.error("Kitchen Food Detail Failed", error.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const nextFilters = { ...filters, [key]: value };
    setFilters(nextFilters);
    fetchFoods(1, pagination.pageSize, keyword, nextFilters);
  };

  const resetFilters = () => {
    const nextFilters = {
      categoryId: undefined,
      kind: undefined,
      minPrice: undefined,
      maxPrice: undefined,
    };
    setFilters(nextFilters);
    fetchFoods(1, pagination.pageSize, keyword, nextFilters);
  };

  const columns = [
    {
      title: "Food",
      dataIndex: "name",
      render: (name, record) => (
        <div>
          <div className="font-semibold text-slate-900">{name}</div>
          <div className="text-sm text-slate-500">
            {record.description || "No description"}
          </div>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "categoryId",
      width: 180,
      render: (category) => category?.name || "-",
    },
    {
      title: "Type",
      dataIndex: "isMenuItem",
      width: 170,
      render: renderFoodType,
    },
    {
      title: "Stock",
      dataIndex: "stockQuantity",
      width: 110,
      render: (value, record) => (record.isMenuItem ? "-" : value ?? 0),
    },
    {
      title: "Price",
      dataIndex: "price",
      width: 150,
      render: formatCurrency,
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
      render: (_, record) => (
        <Button icon={<EyeOutlined />} onClick={() => openDetailDrawer(record)} />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Kitchen Foods"
        description="View foods available for kitchen preparation and daily service."
        breadcrumbs={["Dashboard", "Kitchen Foods"]}
        extra={
          <Button
            icon={<ReloadOutlined />}
            loading={loading}
            onClick={() =>
              fetchFoods(pagination.current, pagination.pageSize, keyword)
            }
          >
            Refresh
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="dashboard-card">
          <Space size={16}>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-unilife-soft text-xl text-unilife">
              <CoffeeOutlined />
            </div>
            <div>
              <div className="text-sm text-slate-500">Current page</div>
              <div className="text-2xl font-bold text-slate-950">
                {stats.total}
              </div>
            </div>
          </Space>
        </Card>
        <Card className="dashboard-card">
          <div className="text-sm text-slate-500">Always available</div>
          <div className="mt-1 text-2xl font-bold text-blue-600">
            {stats.alwaysAvailable}
          </div>
        </Card>
        <Card className="dashboard-card">
          <div className="text-sm text-slate-500">Menu items</div>
          <div className="mt-1 text-2xl font-bold text-purple-600">
            {stats.menuItems}
          </div>
        </Card>
      </div>

      <Card
        className="dashboard-card"
        title="Foods"
        extra={
          <Space wrap>
            <Search
              allowClear
              enterButton={<SearchOutlined />}
              placeholder="Search food..."
              style={{ width: 280 }}
              onSearch={(value) => {
                setKeyword(value);
                fetchFoods(1, pagination.pageSize, value, filters);
              }}
            />
            <Select
              allowClear
              placeholder="Category"
              style={{ width: 180 }}
              value={filters.categoryId}
              options={filterOptions.categories.map((category) => ({
                value: category.categoryId,
                label: category.name || "Uncategorized",
              }))}
              onChange={(value) => handleFilterChange("categoryId", value)}
            />
            <Select
              allowClear
              placeholder="Type"
              style={{ width: 180 }}
              value={filters.kind}
              options={[
                { label: "Always Available", value: "alwaysAvailable" },
                { label: "Menu Item", value: "menuItem" },
              ].filter((option) =>
                filterOptions.kindOptions.length
                  ? filterOptions.kindOptions.includes(option.value)
                  : true,
              )}
              onChange={(value) => handleFilterChange("kind", value)}
            />
            <InputNumber
              min={0}
              placeholder="Min price"
              style={{ width: 130 }}
              value={filters.minPrice}
              onChange={(value) => handleFilterChange("minPrice", value)}
            />
            <InputNumber
              min={0}
              placeholder="Max price"
              style={{ width: 130 }}
              value={filters.maxPrice}
              onChange={(value) => handleFilterChange("maxPrice", value)}
            />
            <Button onClick={resetFilters}>Reset Filters</Button>
          </Space>
        }
      >
        <Table
          rowKey="_id"
          loading={loading}
          columns={columns}
          dataSource={foods}
          scroll={{ x: 950 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `${total} foods`,
          }}
          onChange={(pager) =>
            fetchFoods(pager.current, pager.pageSize, keyword, filters)
          }
        />
      </Card>

      <Drawer
        title="Kitchen Food Detail"
        placement="right"
        width={560}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      >
        <Spin spinning={detailLoading}>
          {selectedFood && (
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Name">
                {selectedFood.name}
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {selectedFood.description || "No description"}
              </Descriptions.Item>
              <Descriptions.Item label="Category">
                {selectedFood.categoryId?.name || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Type">
                {renderFoodType(selectedFood.isMenuItem)}
              </Descriptions.Item>
              <Descriptions.Item label="Stock quantity">
                {selectedFood.isMenuItem ? "-" : selectedFood.stockQuantity ?? 0}
              </Descriptions.Item>
              <Descriptions.Item label="Price">
                {formatCurrency(selectedFood.price)}
              </Descriptions.Item>
              <Descriptions.Item label="Food ID">
                {selectedFood.foodId || selectedFood._id}
              </Descriptions.Item>
              <Descriptions.Item label="Created at">
                {formatDateTime(selectedFood.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Updated at">
                {formatDateTime(selectedFood.updatedAt)}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Spin>
      </Drawer>
    </div>
  );
}
