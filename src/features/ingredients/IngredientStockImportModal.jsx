import React, { useEffect } from "react";
import {
  Alert,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Typography,
} from "antd";
import dayjs from "dayjs";

const asNumber = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const hasBatchWithExpiryDate = (batches, expiryDate) => {
  if (!expiryDate) return false;

  return batches.some(
    (batch) =>
      batch?.expiryDate &&
      dayjs(batch.expiryDate).isSame(expiryDate, "day"),
  );
};

export default function IngredientStockImportModal({
  open,
  ingredient,
  batches = [],
  suppliers = [],
  supplierLoading = false,
  loading,
  onCancel,
  onSubmit,
}) {
  const [form] = Form.useForm();
  const unit = ingredient?.unit || "unit";
  const currentStock = asNumber(ingredient?.currentStock);

  useEffect(() => {
    if (!open) return;

    form.resetFields();
    form.setFieldsValue({
      quantity: 1,
      expiryDate: undefined,
      supplierId: undefined,
      unitPrice: undefined,
      importCode: "",
      reason: "Stock import",
    });
  }, [form, ingredient, open]);

  const supplierOptions = suppliers
    .filter((supplier) => supplier?.isActive !== false)
    .map((supplier) => ({
      label: supplier.name || "Unnamed Supplier",
      value: supplier._id || supplier.id,
    }))
    .filter((option) => option.value);

  const handleOk = async () => {
    const values = await form.validateFields();

    await onSubmit({
      ...values,
      quantity: asNumber(values.quantity),
      expiryDate: values.expiryDate?.format("YYYY-MM-DD"),
      reason: values.reason.trim(),
      importCode: values.importCode?.trim() || undefined,
    });
  };

  return (
    <Modal
      title="Record Stock Import"
      open={open}
      confirmLoading={loading}
      onCancel={onCancel}
      onOk={handleOk}
      okText="Record Import"
      destroyOnClose
    >
      <Alert
        className="mb-4"
        type="info"
        showIcon
        message="A stock import creates a new expiry batch and records transaction history."
      />

      <div className="mb-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
        <Typography.Text strong>
          {ingredient?.name || "Unnamed Ingredient"}
        </Typography.Text>
        <div className="mt-1 text-sm text-slate-500">
          Current stock: {currentStock.toFixed(1)} {unit}
        </div>
      </div>

      <Form form={form} layout="vertical" preserve={false}>
        <Form.Item
          name="quantity"
          label="Import Quantity"
          rules={[
            { required: true, message: "Please enter import quantity" },
            {
              validator: (_, value) => {
                const numberValue = Number(value);

                if (!Number.isFinite(numberValue) || numberValue <= 0) {
                  return Promise.reject(
                    new Error("Import quantity must be greater than zero"),
                  );
                }

                return Promise.resolve();
              },
            },
          ]}
        >
          <InputNumber
            className="w-full"
            min={0.01}
            precision={2}
            addonAfter={unit}
          />
        </Form.Item>

        <Form.Item
          name="expiryDate"
          label="Expiry Date"
          rules={[
            { required: true, message: "Please choose expiry date" },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve();

                if (hasBatchWithExpiryDate(batches, value)) {
                  return Promise.reject(
                    new Error(
                      "A batch with this expiry date already exists for this ingredient",
                    ),
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
              current && current.endOf("day").isBefore(dayjs())
            }
            format="DD/MM/YYYY"
          />
        </Form.Item>

        <Form.Item name="supplierId" label="Supplier">
          <Select
            allowClear
            loading={supplierLoading}
            options={supplierOptions}
            placeholder="Select supplier"
          />
        </Form.Item>

        <Form.Item name="unitPrice" label="Unit Price">
          <InputNumber
            className="w-full"
            min={0}
            precision={2}
            placeholder="Optional"
          />
        </Form.Item>

        <Form.Item
          name="importCode"
          label="Import Code"
          rules={[
            { max: 80, message: "Import code must be 80 characters or less" },
          ]}
        >
          <Input placeholder="Invoice, receipt, or import reference" />
        </Form.Item>

        <Form.Item
          name="reason"
          label="Reason"
          rules={[
            { required: true, message: "Please enter import reason" },
            { min: 5, message: "Reason should be at least 5 characters" },
            { max: 250, message: "Reason must be 250 characters or less" },
          ]}
        >
          <Input.TextArea
            rows={3}
            maxLength={250}
            showCount
            placeholder="Example: supplier delivery, monthly stock import..."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
