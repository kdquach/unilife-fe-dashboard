import React from "react";
import {
  Button,
  Image,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import {
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";

import {
  getImageUrl,
  imageNotFound,
} from "../../utils/image";
import { formatDateTime } from "../../utils/format";

const formatCurrency = (value) =>
  `${Number(value || 0).toLocaleString(
    "vi-VN"
  )} VND`;

const getCategoryName = (category) => {
  if (!category) return "Uncategorized";

  if (typeof category === "string") {
    return category;
  }

  return category.name || "Uncategorized";
};

const getRecordId = (record) =>
  record?._id ||
  record?.id ||
  record?.foodId;

export default function FoodTable({
  foods,
  loading,
  pagination,
  actionLoadingId,
  onView,
  onEdit,
  onPageChange,
}) {
  const columns = [
    {
      title: "Food",
      dataIndex: "name",
      width: 280,
      render: (value, record) => (
        <div className="flex items-center gap-3">
          <Image
            src={getImageUrl(record.imageUrl)}
            fallback={imageNotFound}
            width={64}
            height={64}
            className="rounded-md object-cover"
            preview={false}
          />

          <div className="min-w-0 flex-1">
            <Typography.Text
              strong
              className="block truncate"
              title={value || "Unnamed Food"}
            >
              {value || "Unnamed Food"}
            </Typography.Text>

            <Typography.Text className="text-xs text-slate-500 truncate" title={getCategoryName(record.categoryId)}>
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
      width: 140,
      render: (value) =>
        value ? (
          <Tag color="purple">
            Menu Item
          </Tag>
        ) : (
          <Tag color="blue">
            Daily
          </Tag>
        ),
    },

    {
      title: "Stock",
      dataIndex: "stockQuantity",
      width: 120,
      render: (value) =>
        value === null ||
        value === undefined
          ? "-"
          : value,
    },

    {
      title: "Recipe",
      dataIndex: "ingredients",
      width: 120,
      render: (value = []) => (
        <Tag
          color={
            value.length > 0
              ? "green"
              : "default"
          }
        >
          {value.length} items
        </Tag>
      ),
    },

    {
      title: "Status",
      dataIndex: "isActive",
      width: 120,
      render: (value) =>
        value ? (
          <Tag color="green">
            Active
          </Tag>
        ) : (
          <Tag color="red">
            Inactive
          </Tag>
        ),
    },

    {
      title: "Updated",
      dataIndex: "updatedAt",
      width: 170,
      render: (value) => formatDateTime(value),
    },

    {
      title: "Actions",
      fixed: "right",
      width: 120,
      render: (_, record) => (
        <Space size={6}>
          <Button
            icon={<EyeOutlined />}
            aria-label={`View ${record.name}`}
            title="View details"
            onClick={() => onView(record)}
          />
          <Button
            icon={<EditOutlined />}
            loading={
              actionLoadingId ===
              getRecordId(record)
            }
            onClick={(e) => {
              e.stopPropagation();
              onEdit(record);
            }}
          />
        </Space>
      ),
    },
  ];

  return (
    <Table
      rowKey={(record) =>
        getRecordId(record)
      }
      loading={loading}
      dataSource={foods}
      columns={columns}
      pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        showSizeChanger: true,
        showTotal: (total) =>
          `${total} foods`,
      }}
      onChange={(nextPagination) =>
        onPageChange(
          nextPagination.current,
          nextPagination.pageSize
        )
      }
    />
  );
}
