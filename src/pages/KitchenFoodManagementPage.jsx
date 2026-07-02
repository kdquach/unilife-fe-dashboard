import React, { useEffect, useMemo, useState } from "react";
import {
  CoffeeOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Button, Card, Space, Table, Tag } from "antd";
import PageHeader from "../components/PageHeader";
import { foodService } from "../features/foods/foodService";
import { formatDateTime } from "../utils/format";
import { notify } from "../utils/notify";

const formatCurrency = (value) =>
  `${Number(value || 0).toLocaleString("vi-VN")} VND`;

const renderFoodType = (isMenuItem) => (
  <Tag color={isMenuItem ? "purple" : "blue"}>
    {isMenuItem ? "Menu Item" : "Always Available"}
  </Tag>
);

export default function KitchenFoodManagementPage() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchFoods = async (
    page = pagination.current,
    limit = pagination.pageSize,
  ) => {
    try {
      setLoading(true);

      const response = await foodService.getKitchenFoods({ page, limit });

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
  }, []);

  const stats = useMemo(() => {
    const menuItems = foods.filter((food) => food.isMenuItem).length;

    return {
      total: foods.length,
      menuItems,
      alwaysAvailable: foods.length - menuItems,
    };
  }, [foods]);

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
            onClick={() => fetchFoods()}
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

      <Card className="dashboard-card" title="Foods">
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
          onChange={(pager) => fetchFoods(pager.current, pager.pageSize)}
        />
      </Card>
    </div>
  );
}
