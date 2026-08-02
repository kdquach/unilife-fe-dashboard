import React from "react";
import {
  Descriptions,
  Drawer,
  Image,
  Spin,
  Table,
  Tag,
  Typography,
} from "antd";

import imageNotFound from "../../assets/image-not-found.png";
import { formatDateTime } from "../../utils/format";
import { getImageUrl } from "../../utils/image";

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

const getIngredientName = (ingredient) => {
  if (!ingredient) return "-";

  if (typeof ingredient === "string") {
    return ingredient;
  }

  return ingredient.name || "-";
};

export default function FoodDetailDrawer({
  open,
  loading,
  food,
  onClose,
}) {
  const recipeColumns = [
    {
      title: "Ingredient",
      render: (_, record) =>
        getIngredientName(record.ingredientId),
    },
    {
      title: "Quantity",
      dataIndex: "quantityPerServing",
      width: 120,
      render: (value) => value ?? "-",
    },
    {
      title: "Unit",
      dataIndex: "unit",
      width: 100,
      render: (value, record) =>
        value ||
        record.ingredientId?.unit ||
        "-",
    },
  ];

  return (
    <Drawer
      title="Food Details"
      placement="right"
      width={620}
      open={open}
      onClose={onClose}
    >
      <Spin spinning={loading}>
        {food && (
          <>
            <div className="mb-5 flex items-center gap-4">
              <Image
                src={getImageUrl(food.imageUrl)}
                fallback={imageNotFound}
                width={104}
                height={104}
                className="rounded-md object-cover"
                preview={Boolean(food.imageUrl)}
                onClick={(e) => e.stopPropagation()}
              />

              <div>
                <Typography.Title
                  level={4}
                  className="!mb-1"
                >
                  {food.name || "Unnamed Food"}
                </Typography.Title>

                <Typography.Text className="text-slate-500">
                  {getCategoryName(
                    food.categoryId
                  )}
                </Typography.Text>
              </div>
            </div>

            <Descriptions
              bordered
              column={1}
              size="small"
            >
              <Descriptions.Item label="Price">
                {formatCurrency(food.price)}
              </Descriptions.Item>

              <Descriptions.Item label="Type">
                {food.isMenuItem ? (
                  <Tag color="purple">
                    Menu Item
                  </Tag>
                ) : (
                  <Tag color="blue">
                    Daily Food
                  </Tag>
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Stock Quantity">
                {food.stockQuantity ??
                  "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Status">
                {food.isActive ? (
                  <Tag color="green">
                    Active
                  </Tag>
                ) : (
                  <Tag color="red">
                    Inactive
                  </Tag>
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Description">
                {food.description || "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Created At">
                {formatDateTime(
                  food.createdAt
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Updated At">
                {formatDateTime(
                  food.updatedAt
                )}
              </Descriptions.Item>
            </Descriptions>

            <Typography.Title
              level={5}
              className="!mt-6 !mb-3"
            >
              Recipe Ingredients
            </Typography.Title>

            <Table
              rowKey={(record) =>
                record._id ||
                record.ingredientId?._id
              }
              size="small"
              pagination={false}
              columns={recipeColumns}
              dataSource={
                food.ingredients || []
              }
            />
          </>
        )}
      </Spin>
    </Drawer>
  );
}