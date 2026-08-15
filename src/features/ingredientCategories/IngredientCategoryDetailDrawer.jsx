import React, { useEffect, useState } from "react";
import { Drawer, Descriptions, Tag, Typography, Timeline, Spin } from "antd";
import { AppstoreOutlined } from "@ant-design/icons";
import { ingredientCategoryService } from "./ingredientCategoryService";
import { formatDateTime } from "../../utils/format";

export default function IngredientCategoryDetailDrawer({
  open,
  categoryId,
  onClose,
}) {
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState(null);

  useEffect(() => {
    if (!open || !categoryId) return;

    const fetchDetail = async () => {
      try {
        setLoading(true);

        const data =
          await ingredientCategoryService.getIngredientCategoryById(categoryId);

        setCategory(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [open, categoryId]);

  return (
    <Drawer
      title="Ingredient Categories Detail"
      width={520}
      open={open}
      onClose={onClose}
      destroyOnHidden
    >
      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: 100,
          }}
        >
          <Spin size="large" />
        </div>
      ) : (
        category && (
          <>
            {/* Header */}
            <div className="mb-6 flex items-center gap-4 rounded-3xl bg-unilife-soft p-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-unilife text-3xl text-white">
                <AppstoreOutlined />
              </div>

              <div>
                <Typography.Title level={4} className="!mb-1">
                  {category.name}
                </Typography.Title>

                <Typography.Text className="text-slate-500">
                  Ingredient Category
                </Typography.Text>

                <div className="mt-2">
                  <Tag color={category.isActive ? "green" : "red"}>
                    {category.isActive ? "Active" : "Inactive"}
                  </Tag>
                </div>
              </div>
            </div>

            {/* Information */}
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Category ID">
                {category.id}
              </Descriptions.Item>

              <Descriptions.Item label=" Ingredient Category Name">
                {category.name}
              </Descriptions.Item>

              <Descriptions.Item label="Status">
                <Tag color={category.isActive ? "green" : "red"}>
                  {category.isActive ? "Active" : "Inactive"}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Created At">
                {formatDateTime(category.createdAt)}
              </Descriptions.Item>

              <Descriptions.Item label="Updated At">
                {formatDateTime(category.updatedAt)}
              </Descriptions.Item>
            </Descriptions>

            {/* Timeline */}
            <Typography.Title level={5} className="!mt-8">
              Category Activity
            </Typography.Title>

            <Timeline
              items={[
                {
                  color: "green",
                  children: "Category created",
                },
                {
                  color: category.isActive ? "blue" : "red",
                  children: category.isActive
                    ? "Category is currently active"
                    : "Category is currently inactive",
                },
                {
                  color: "orange",
                  children: "This category can be assigned to Ingredients.",
                },
              ]}
            />
          </>
        )
      )}
    </Drawer>
  );
}
