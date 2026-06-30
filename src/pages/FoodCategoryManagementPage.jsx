import React, { useEffect, useMemo, useState } from "react";
import {
  AppstoreOutlined,
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
  Select,
  Space,
  Spin,
  Table,
  Tag,
  message,
} from "antd";
import PageHeader from "../components/PageHeader";
import { foodCategoryService } from "../features/foodCategories/foodCategoryService";
import { formatDateTime } from "../utils/format";

const statusOptions = [
  { label: "Active", value: "true" },
  { label: "Inactive", value: "false" },
];

export default function FoodCategoryManagementPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [filters, setFilters] = useState({ isActive: undefined });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const { Search } = Input;

  const fetchCategories = async (
    page = pagination.current,
    pageSize = pagination.pageSize,
    searchKeyword = keyword,
    currentFilters = filters,
  ) => {
    setLoading(true);

    try {
      const response = await foodCategoryService.getFoodCategories({
        page,
        limit: pageSize,
        keyword: searchKeyword,
        ...currentFilters,
      });

      setCategories(response.data);
      setPagination({
        current: response.pagination.page,
        pageSize: response.pagination.limit,
        total: response.pagination.total,
      });
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(1, pagination.pageSize);
  }, []);

  const stats = useMemo(() => {
    const active = categories.filter((category) => category.isActive).length;
    return { active, inactive: categories.length - active };
  }, [categories]);

  const handleStatusFilter = (value) => {
    const newFilters = { ...filters, isActive: value };
    setFilters(newFilters);
    fetchCategories(1, pagination.pageSize, keyword, newFilters);
  };

  const openDetailDrawer = async (category) => {
    setSelectedCategory(category);
    setDetailOpen(true);
    setDetailLoading(true);

    try {
      const data = await foodCategoryService.getFoodCategoryById(category._id);
      setSelectedCategory(data);
    } catch (error) {
      message.error(error.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const columns = [
    {
      title: "Category",
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
      title: "Status",
      dataIndex: "isActive",
      width: 140,
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Created at",
      dataIndex: "createdAt",
      width: 180,
      render: formatDateTime,
    },
    {
      title: "Updated at",
      dataIndex: "updatedAt",
      width: 180,
      render: formatDateTime,
    },
    {
      title: "Actions",
      fixed: "right",
      width: 100,
      render: (_, record) => (
        <Button icon={<EyeOutlined />} onClick={() => openDetailDrawer(record)} />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Food Categories"
        description="Manage the category groups used to organize foods in UniLife."
        breadcrumbs={["Dashboard", "Food Categories"]}
        extra={
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
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="dashboard-card">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-unilife-soft text-xl text-unilife">
              <AppstoreOutlined />
            </div>
            <div>
              <div className="text-sm text-slate-500">Current page</div>
              <div className="text-2xl font-bold text-slate-950">
                {categories.length}
              </div>
            </div>
          </div>
        </Card>
        <Card className="dashboard-card">
          <div className="text-sm text-slate-500">Active on page</div>
          <div className="mt-1 text-2xl font-bold text-green-600">
            {stats.active}
          </div>
        </Card>
        <Card className="dashboard-card">
          <div className="text-sm text-slate-500">Inactive on page</div>
          <div className="mt-1 text-2xl font-bold text-red-500">
            {stats.inactive}
          </div>
        </Card>
      </div>

      <Card
        className="dashboard-card"
        title="Categories"
        extra={
          <Space wrap>
            <Search
              allowClear
              enterButton={<SearchOutlined />}
              placeholder="Search category..."
              style={{ width: 260 }}
              onSearch={(value) => {
                setKeyword(value);
                fetchCategories(1, pagination.pageSize, value, filters);
              }}
            />
            <Select
              allowClear
              placeholder="Status"
              style={{ width: 150 }}
              options={statusOptions}
              onChange={handleStatusFilter}
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
            onChange: (page, pageSize) =>
              fetchCategories(page, pageSize, keyword, filters),
          }}
        />
      </Card>

      <Drawer
        title="Food Category Details"
        placement="right"
        width={520}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      >
        <Spin spinning={detailLoading}>
          {selectedCategory && (
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Name">
                {selectedCategory.name}
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {selectedCategory.description || "No description"}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={selectedCategory.isActive ? "green" : "red"}>
                  {selectedCategory.isActive ? "Active" : "Inactive"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Category ID">
                {selectedCategory.foodCategoryId || selectedCategory._id}
              </Descriptions.Item>
              <Descriptions.Item label="Created at">
                {formatDateTime(selectedCategory.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Updated at">
                {formatDateTime(selectedCategory.updatedAt)}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Spin>
      </Drawer>
    </div>
  );
}
