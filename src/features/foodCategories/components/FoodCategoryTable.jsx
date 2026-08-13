import React from "react";
import { Table, Space, Button, Tag } from "antd";
import { EyeOutlined, EditOutlined } from "@ant-design/icons";
import { formatDateTime } from "../../../utils/format";

/**
 * Food categories table with actions
 */
export default function FoodCategoryTable({
  categories,
  loading,
  pagination,
  onViewDetail,
  onEdit,
  onPaginationChange,
}) {
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
      render: (value) => formatDateTime(value),
    },
    {
      title: "Updated at",
      dataIndex: "updatedAt",
      width: 180,
      render: (value) => formatDateTime(value),
    },
    {
      title: "Actions",
      width: 110,
      align: "center",
      render: (_, record) => (
        <Space size={6}>
          <Button
            icon={<EyeOutlined />}
            aria-label={`View ${record.name}`}
            title="View details"
            onClick={() => onViewDetail?.(record)}
          />
          <Button
            icon={<EditOutlined />}
            aria-label={`Edit ${record.name}`}
            title="Edit"
            onClick={() => onEdit?.(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <Table
      rowKey="_id"
      loading={loading}
      columns={columns}
      dataSource={categories}
      pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        showSizeChanger: true,
        showTotal: (total) => `${total} categories`,
      }}
      onChange={(pager) => {
        onPaginationChange?.(pager);
      }}
    />
  );
}
