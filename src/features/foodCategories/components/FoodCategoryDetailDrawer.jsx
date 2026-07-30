import React from "react";
import { Drawer, Descriptions, Tag, Spin } from "antd";
import { formatDateTime } from "../../../utils/format";

/**
 * Drawer showing detailed food category information
 */
export default function FoodCategoryDetailDrawer({
  open,
  onClose,
  selectedCategory,
  loading,
}) {
  return (
    <Drawer
      title="Food Category Details"
      placement="right"
      width={520}
      open={open}
      onClose={onClose}
    >
      <Spin spinning={loading}>
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
  );
}
