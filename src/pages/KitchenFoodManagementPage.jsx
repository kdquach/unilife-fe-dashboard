import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Descriptions,
  Drawer,
  Image,
  Input,
  InputNumber,
  Select,
  Space,
  Spin,
  Table,
  Tag,
} from "antd";
import { EyeOutlined, ReloadOutlined, SearchOutlined, CoffeeOutlined } from "@ant-design/icons";
import PageHeader from "../components/PageHeader";
import { COLORS } from "../features/orders/utils/orderUtils.jsx";
import { formatDateTime } from "../utils/format";
import { getImageUrl } from "../utils/image";
import { imageNotFound } from "../utils/image";

// Hooks
import { useKitchenFoods } from "../features/kitchen/hooks/useKitchenFoods";

// Services
import { foodService } from "../features/foods/foodService";

const formatCurrency = (value) =>
  `${Number(value || 0).toLocaleString("vi-VN")} VND`;

const { Search } = Input;

const renderFoodType = (isMenuItem) => (
  <Tag color={isMenuItem ? "purple" : "blue"}>
    {isMenuItem ? "Menu Item" : "Always Available"}
  </Tag>
);

export default function KitchenFoodManagementPage() {
  // Local state for modals and selection
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

  // Custom hook
  const { foods, loading, pagination, fetchFoods } = useKitchenFoods();

  // Initial data fetch
  useEffect(() => {
    fetchFoods(1, 10, "", filters);
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
      console.error("Food Filters Load Failed", error.message);
    }
  };

  const stats = {
    total: foods.length,
    menuItems: foods.filter((food) => food.isMenuItem).length,
    alwaysAvailable: foods.length - foods.filter((food) => food.isMenuItem).length,
  };

  const openDetailDrawer = async (food) => {
    setSelectedFood(food);
    setDetailOpen(true);
    setDetailLoading(true);

    try {
      const data = await foodService.getKitchenFoodById(food._id);
      setSelectedFood(data);
    } catch (error) {
      console.error("Food Detail Failed", error.message);
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
        <div className="flex items-center gap-3">
          <Image
            src={getImageUrl(record.imageUrl)}
            fallback={imageNotFound}
            width={64}
            height={64}
            className="rounded-md object-cover"
            preview={Boolean(record.imageUrl)}
          />
          <div>
            <div className="font-semibold text-slate-900">{name}</div>
            <div className="text-sm text-slate-500">
              {record.description || "No description"}
            </div>
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
        title="Foods"
        description="View foods available for kitchen preparation and daily service."
        breadcrumbs={["Dashboard", "Foods"]}
        extra={
          <Button
            icon={<ReloadOutlined />}
            loading={loading}
            onClick={() =>
              fetchFoods(pagination.current, pagination.pageSize, keyword, filters)
            }
          >
            Refresh
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
              <div className="text-sm text-slate-500">Current page</div>
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
              <CoffeeOutlined />
            </div>
          </div>
        </Card>

        <Card
          className="dashboard-card"
          styles={{ body: { padding: "16px 18px" } }}
          style={{
            borderRadius: 14,
            borderTop: `3px solid ${COLORS.blue}`,
            boxShadow: "0 2px 10px rgba(20, 20, 43, 0.05)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">Always available</div>
              <div className="mt-1 text-2xl font-bold" style={{ color: COLORS.blue }}>
                {stats.alwaysAvailable}
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
                background: `${COLORS.blue}1a`,
                color: COLORS.blue,
                fontSize: 18,
              }}
            >
              ∞
            </div>
          </div>
        </Card>

        <Card
          className="dashboard-card"
          styles={{ body: { padding: "16px 18px" } }}
          style={{
            borderRadius: 14,
            borderTop: `3px solid ${COLORS.purple}`,
            boxShadow: "0 2px 10px rgba(20, 20, 43, 0.05)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">Menu items</div>
              <div className="mt-1 text-2xl font-bold" style={{ color: COLORS.purple }}>
                {stats.menuItems}
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
                background: `${COLORS.purple}1a`,
                color: COLORS.purple,
                fontSize: 18,
              }}
            >
              ◆
            </div>
          </div>
        </Card>
      </div>

      <Card
        title="Foods"
        style={{ borderRadius: 14, boxShadow: "0 2px 10px rgba(20, 20, 43, 0.05)" }}
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
        title="Food Detail"
        placement="right"
        width={560}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      >
        <Spin spinning={detailLoading}>
          {selectedFood && (
            <>
              <Image
                src={getImageUrl(selectedFood.imageUrl)}
                fallback={imageNotFound}
                width="100%"
                height={260}
                className="mb-4 rounded-lg object-cover"
                preview={Boolean(selectedFood.imageUrl)}
              />
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
                  {selectedFood.isMenuItem
                    ? "-"
                    : selectedFood.stockQuantity ?? 0}
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
            </>
          )}
        </Spin>
      </Drawer>
    </div>
  );
}
