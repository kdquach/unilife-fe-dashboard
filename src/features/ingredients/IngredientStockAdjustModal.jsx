import React, { useEffect, useMemo } from "react";
import {
  Alert,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Select,
  Space,
  Typography,
} from "antd";
import dayjs from "dayjs";

import { formatDate } from "../../utils/format";

const ADJUSTMENT_TYPES = {
  INCREASE: "INCREASE",
  DECREASE: "DECREASE",
  SET: "SET",
};

const asNumber = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const getIngredientName = (ingredient) =>
  ingredient?.name || "Unnamed Ingredient";

const getExpirySortValue = (batch) => {
  if (!batch?.expiryDate) return Number.MAX_SAFE_INTEGER;

  const expiryTime = new Date(batch.expiryDate).getTime();
  return Number.isFinite(expiryTime) ? expiryTime : Number.MAX_SAFE_INTEGER;
};

const getCreatedSortValue = (batch) => {
  const createdTime = new Date(batch?.createdAt).getTime();
  return Number.isFinite(createdTime) ? createdTime : Number.MAX_SAFE_INTEGER;
};

const getDateKey = (value) => {
  if (!value) return "";

  const date = dayjs(value);
  return date.isValid() ? date.format("YYYY-MM-DD") : "";
};

export default function IngredientStockAdjustModal({
  open,
  ingredient,
  batches = [],
  batchLoading = false,
  loading,
  onCancel,
  onSubmit,
}) {
  const [form] = Form.useForm();
  const adjustmentType = Form.useWatch("adjustmentType", form);
  const quantity = Form.useWatch("quantity", form);
  const batchId = Form.useWatch("batchId", form);

  const currentStock = asNumber(ingredient?.currentStock);
  const unit = ingredient?.unit || "unit";
  const selectedBatch = batches.find((batch) => batch._id === batchId);

  useEffect(() => {
    if (!open) return;

    form.setFieldsValue({
      adjustmentType: ADJUSTMENT_TYPES.INCREASE,
      batchId: undefined,
      expiryDate: undefined,
      quantity: 1,
      reason: "",
    });
  }, [form, open, ingredient]);

  const stockAfter = useMemo(() => {
    const value = asNumber(quantity);

    if (adjustmentType === ADJUSTMENT_TYPES.DECREASE) {
      return Math.max(currentStock - value, 0);
    }

    if (adjustmentType === ADJUSTMENT_TYPES.SET) {
      return value;
    }

    return currentStock + value;
  }, [adjustmentType, currentStock, quantity]);

  const batchOptions = batches
    .filter((batch) => asNumber(batch.remainingQuantity) > 0)
    .sort((a, b) => {
      const aExpiry = getExpirySortValue(a);
      const bExpiry = getExpirySortValue(b);
      if (aExpiry !== bExpiry) return aExpiry - bExpiry;

      const aCreated = getCreatedSortValue(a);
      const bCreated = getCreatedSortValue(b);
      if (aCreated !== bCreated) return aCreated - bCreated;

      return String(a._id).localeCompare(String(b._id));
    })
    .map((batch) => ({
      label: `${formatDate(batch.expiryDate)} - ${asNumber(
        batch.remainingQuantity,
      )} ${unit} left`,
      value: batch._id,
    }));

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const value = asNumber(values.quantity);
    let nextStock = currentStock;

    if (values.adjustmentType === ADJUSTMENT_TYPES.DECREASE) {
      nextStock = currentStock - value;
    } else if (values.adjustmentType === ADJUSTMENT_TYPES.SET) {
      nextStock = value;
    } else {
      nextStock = currentStock + value;
    }

    await onSubmit({
      ...values,
      quantity: value,
      stockBefore: currentStock,
      stockAfter: nextStock,
    });
  };

  return (
    <Modal
      title="Adjust Ingredient Stock"
      open={open}
      confirmLoading={loading}
      onCancel={onCancel}
      onOk={handleSubmit}
      okText="Save Adjustment"
      destroyOnHidden
    >
      <Alert
        className="mb-4"
        type="info"
        showIcon
        message="Stock changes are saved by batch and recorded in transaction history."
      />

      <div className="mb-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
        <Typography.Text strong>{getIngredientName(ingredient)}</Typography.Text>
        <div className="mt-1 text-sm text-slate-500">
          Current stock: {currentStock.toFixed(1)} {unit}
        </div>
      </div>

      <Form form={form} layout="vertical" preserve={false}>
        <Form.Item
          name="adjustmentType"
          label="Adjustment Type"
          rules={[{ required: true, message: "Please choose adjustment type" }]}
        >
          <Radio.Group>
            <Radio.Button value={ADJUSTMENT_TYPES.INCREASE}>Add</Radio.Button>
            <Radio.Button value={ADJUSTMENT_TYPES.DECREASE}>Remove</Radio.Button>
            <Radio.Button value={ADJUSTMENT_TYPES.SET}>Set Stock</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="quantity"
          label={adjustmentType === ADJUSTMENT_TYPES.SET ? "New Stock" : "Quantity"}
          rules={[
            { required: true, message: "Please enter a quantity" },
            {
              validator: (_, value) => {
                const numberValue = Number(value);

                if (!Number.isFinite(numberValue) || numberValue < 0) {
                  return Promise.reject(
                    new Error("Quantity must be zero or greater"),
                  );
                }

                if (
                  adjustmentType === ADJUSTMENT_TYPES.DECREASE &&
                  numberValue > currentStock
                ) {
                  return Promise.reject(
                    new Error("Cannot remove more than current stock"),
                  );
                }

                if (
                  adjustmentType === ADJUSTMENT_TYPES.DECREASE &&
                  selectedBatch &&
                  numberValue > asNumber(selectedBatch.remainingQuantity)
                ) {
                  return Promise.reject(
                    new Error("Cannot remove more than selected batch stock"),
                  );
                }

                if (
                  adjustmentType === ADJUSTMENT_TYPES.SET &&
                  numberValue > currentStock
                ) {
                  return Promise.reject(
                    new Error("Use Add stock when increasing stock so an expiry batch is recorded"),
                  );
                }

                if (
                  adjustmentType !== ADJUSTMENT_TYPES.SET &&
                  numberValue === 0
                ) {
                  return Promise.reject(
                    new Error("Quantity must be greater than zero"),
                  );
                }

                return Promise.resolve();
              },
            },
          ]}
        >
          <InputNumber
            className="w-full"
            min={0}
            precision={2}
            addonAfter={unit}
          />
        </Form.Item>

        {adjustmentType === ADJUSTMENT_TYPES.INCREASE && (
          <>
            <Form.Item
              name="expiryDate"
              label="Expiry Date"
              rules={[
                {
                  required: true,
                  message: "Please choose expiry date for the new batch",
                },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();

                    if (!value.startOf("day").isAfter(dayjs().startOf("day"))) {
                      return Promise.reject(
                        new Error("Expiry date must be a future date"),
                      );
                    }

                    const selectedDate = getDateKey(value);
                    const duplicateBatch = batches.some(
                      (batch) => getDateKey(batch.expiryDate) === selectedDate,
                    );

                    if (duplicateBatch) {
                      return Promise.reject(
                        new Error("A batch with this expiry date already exists"),
                      );
                    }

                    return Promise.resolve();
                  },
                },
              ]}
            >
              <DatePicker
                className="w-full"
                disabledDate={(current) =>
                  current &&
                  !current.startOf("day").isAfter(dayjs().startOf("day"))
                }
                format="DD/MM/YYYY"
              />
            </Form.Item>
          </>
        )}

        {adjustmentType === ADJUSTMENT_TYPES.DECREASE && (
          <Form.Item
            name="batchId"
            label="Batch"
            extra="Leave empty to automatically remove from the earliest-expiring batches."
          >
            <Select
              allowClear
              loading={batchLoading}
              options={batchOptions}
              placeholder="Auto by expiry date"
            />
          </Form.Item>
        )}

        {adjustmentType === ADJUSTMENT_TYPES.SET && (
          <Alert
            className="mb-4"
            type="warning"
            showIcon
            message="Set Stock changes only the total stock. Use Add/Remove when the change belongs to a specific expiry batch."
          />
        )}

        <div className="mb-4 rounded-2xl border border-slate-100 p-4">
          <Space className="w-full justify-between">
            <Typography.Text className="text-slate-500">Stock Before</Typography.Text>
            <Typography.Text strong>
              {currentStock} {unit}
            </Typography.Text>
          </Space>
          <Space className="mt-2 w-full justify-between">
            <Typography.Text className="text-slate-500">Stock After</Typography.Text>
            <Typography.Text strong>
              {stockAfter} {unit}
            </Typography.Text>
          </Space>
        </div>

        <Form.Item
          name="reason"
          label="Reason"
          rules={[
            { required: true, message: "Please enter the adjustment reason" },
            {
              validator: (_, value) => {
                const reason = String(value || "").trim();

                if (!reason) {
                  return Promise.reject(
                    new Error("Please enter the adjustment reason"),
                  );
                }

                if (reason.length < 5) {
                  return Promise.reject(
                    new Error("Reason should be at least 5 characters"),
                  );
                }

                return Promise.resolve();
              },
            },
          ]}
        >
          <Input.TextArea
            rows={3}
            maxLength={250}
            showCount
            placeholder="Example: physical count correction, damaged item, kitchen usage..."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
