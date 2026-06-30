import React, { useEffect, useMemo, useState } from "react";
import { Card, Table, Tag, Input, Button } from "antd";
import {
  PlusOutlined,
  AppstoreOutlined,
  EyeOutlined,
} from "@ant-design/icons";

import PageHeader from "../components/PageHeader";
import { ingredientCategoryService } from "../features/ingredientCategories/ingredientCategoryService";
import IngredientCategoryDetailDrawer from "../features/ingredientCategories/IngredientCategoryDetailDrawer";

const { Search } = Input;

export default function IngredientCategoryManagementPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [keyword, setKeyword] = useState("");

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

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

      let data = response.data;

      if (searchKeyword) {
        data = data.filter((item) =>
          item.name.toLowerCase().includes(searchKeyword.toLowerCase())
        );
      }

      setCategories(data);

      setPagination({
        current: response.pagination.page,
        pageSize: response.pagination.limit,
        total: response.pagination.total,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(1, 10);
  }, []);

  const stats = useMemo(() => {
    const active = categories.filter((item) => item.isActive).length;

    return {
      active,
      inactive: categories.length - active,
    };
  }, [categories]);

  const openDrawer = (id) => {
    setSelectedId(id);
    setDrawerOpen(true);
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
    {
      title: "Action",
      key: "action",
      width: 100,
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => openDrawer(record.id)}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Ingredient Category Management"
        description="Manage ingredient categories."
        breadcrumbs={["Dashboard", "Ingredient Categories"]}
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            Create Category
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
              <div className="text-sm text-slate-500">Categories</div>
              <div className="text-2xl font-bold">{categories.length}</div>
            </div>
          </div>
        </Card>

        <Card className="dashboard-card">
          <div className="text-sm text-slate-500">Active</div>
          <div className="mt-1 text-2xl font-bold text-green-600">
            {stats.active}
          </div>
        </Card>

        <Card className="dashboard-card">
          <div className="text-sm text-slate-500">Inactive</div>
          <div className="mt-1 text-2xl font-bold text-red-600">
            {stats.inactive}
          </div>
        </Card>
      </div>

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
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={categories}
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

      <IngredientCategoryDetailDrawer
        open={drawerOpen}
        categoryId={selectedId}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}