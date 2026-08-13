import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Descriptions,
  Drawer,
  Empty,
  List,
  Progress,
  Spin,
  Tag,
  Typography,
} from "antd";
import {
  DatabaseOutlined,
  InboxOutlined,
  WarningOutlined,
} from "@ant-design/icons";

import { ingredientService } from "./ingredientService";
import { formatStorageType } from "./ingredientConstants";
import { formatDate, formatDateTime } from "../../utils/format";

const getIngredientId = (ingredient) =>
  ingredient?._id || ingredient?.id || ingredient?.ingredientId || "-";

const getCategoryName = (category) => {
  if (!category) return "Uncategorized";
  if (typeof category === "string") return category;
  return category.name || category._id || "Uncategorized";
};

const asNumber = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const formatUnitPrice = (value) => {
  const numberValue = Number(value);

  return Number.isFinite(numberValue)
    ? `${numberValue.toLocaleString("vi-VN", {
        maximumFractionDigits: 2,
      })} VND`
    : "-";
};

export default function IngredientDetailDrawer({ open, ingredientId, onClose }) {
  const [loading, setLoading] = useState(false);
  const [ingredient, setIngredient] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !ingredientId) return;

    let isMounted = true;

    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await ingredientService.getIngredientById(ingredientId);

        if (isMounted) {
          setIngredient(data);
        }
      } catch (err) {
        if (isMounted) {
          setIngredient(null);
          setError(err.message || "Unable to load ingredient detail");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDetail();

    return () => {
      isMounted = false;
    };
  }, [open, ingredientId]);

  const stockStatus = useMemo(() => {
    const rawStock = asNumber(ingredient?.currentStock);
    const threshold = asNumber(ingredient?.minStockThreshold);
    const isLowStock = threshold > 0 && rawStock <= threshold;
    const percent = threshold > 0
      ? Math.min(Math.round((rawStock / threshold) * 100), 100)
      : 100;

    return {
      currentStock: rawStock.toFixed(1),
      threshold,
      isLowStock,
      percent,
    };
  }, [ingredient]);

  const statusTag = ingredient?.isActive ? (
    <Tag color="green">Active</Tag>
  ) : (
    <Tag color="red">Inactive</Tag>
  );
  const batches = Array.isArray(ingredient?.batches) ? ingredient.batches : [];

  return (
    <Drawer
      title="Ingredient Detail"
      width={560}
      open={open}
      onClose={onClose}
      destroyOnHidden
    >
      {loading ? (
        <div className="mt-24 flex justify-center">
          <Spin size="large" />
        </div>
      ) : error ? (
        <Alert
          type="error"
          showIcon
          message="Cannot load ingredient"
          description={error}
        />
      ) : ingredient ? (
        <>
          <div className="mb-6 flex items-center gap-4 rounded-3xl bg-unilife-soft p-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-unilife text-3xl text-white">
              <DatabaseOutlined />
            </div>

            <div className="min-w-0">
              <Typography.Title level={4} className="!mb-1 truncate">
                {ingredient.name || "Unnamed Ingredient"}
              </Typography.Title>

              <Typography.Text className="text-slate-500">
                {getCategoryName(ingredient.categoryId)}
              </Typography.Text>

              <div className="mt-2 flex flex-wrap gap-2">
                {statusTag}
                {stockStatus.isLowStock && (
                  <Tag color="warning" icon={<WarningOutlined />}>
                    Low Stock
                  </Tag>
                )}
              </div>
            </div>
          </div>

          <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <Typography.Text strong>Stock Level</Typography.Text>
              <Typography.Text>
                {stockStatus.currentStock} {ingredient.unit || "unit"}
              </Typography.Text>
            </div>
            <Progress
              percent={stockStatus.percent}
              status={stockStatus.isLowStock ? "exception" : "active"}
              showInfo={false}
            />
            <Typography.Text className="text-xs text-slate-500">
              Minimum threshold: {stockStatus.threshold}{" "}
              {ingredient.unit || "unit"}
            </Typography.Text>
          </div>

          <Descriptions bordered column={1}>
            <Descriptions.Item label="Ingredient ID">
              {getIngredientId(ingredient)}
            </Descriptions.Item>
            <Descriptions.Item label="Ingredient Name">
              {ingredient.name || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Category">
              {getCategoryName(ingredient.categoryId)}
            </Descriptions.Item>
            <Descriptions.Item label="Unit">
              {ingredient.unit || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Storage Type">
              {formatStorageType(ingredient.storageType)}
            </Descriptions.Item>
            <Descriptions.Item label="Current Stock">
              {stockStatus.currentStock}
            </Descriptions.Item>
            <Descriptions.Item label="Minimum Stock Threshold">
              {stockStatus.threshold}
            </Descriptions.Item>
            <Descriptions.Item label="Status">{statusTag}</Descriptions.Item>
            <Descriptions.Item label="Created At">
              {formatDateTime(ingredient.createdAt)}
            </Descriptions.Item>
            <Descriptions.Item label="Updated At">
              {formatDateTime(ingredient.updatedAt)}
            </Descriptions.Item>
          </Descriptions>

          <Typography.Title level={5} className="!mt-8">
            Batches & Expiry
          </Typography.Title>

          <List
            dataSource={batches}
            locale={{ emptyText: "No batches recorded yet" }}
            renderItem={(batch) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <div className="flex flex-wrap items-center gap-2">
                      <Typography.Text strong>
                        {asNumber(batch.remainingQuantity)} /{" "}
                        {asNumber(batch.quantity)} {ingredient.unit || "unit"}
                      </Typography.Text>
                      <Tag color={batch.expiryDate ? "orange" : "default"}>
                        Exp: {formatDate(batch.expiryDate)}
                      </Tag>
                    </div>
                  }
                  description={
                    <div className="space-y-1 text-xs text-slate-500">
                      <div>Batch ID: {batch._id || batch.id || "-"}</div>
                      <div>Unit price: {formatUnitPrice(batch.unitPrice)}</div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </>
      ) : (
        <Empty
          image={<InboxOutlined className="text-5xl text-slate-300" />}
          description="No ingredient detail available"
        />
      )}
    </Drawer>
  );
}
