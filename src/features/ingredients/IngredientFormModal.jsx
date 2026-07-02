import React, { useEffect } from "react";
import { Form, Input, InputNumber, Modal, Select, Switch } from "antd";

const MAX_MIN_STOCK_THRESHOLD = 1000000;
const TEXT_HAS_LETTER = /\p{L}/u;
const TEXT_ALLOWED_CHARS = /^[\p{L}\s]+$/u;

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ");

const normalizeInitialValues = (values) => ({
  categoryId:
    typeof values?.categoryId === "object"
      ? values.categoryId?._id
      : values?.categoryId,
  name: values?.name || "",
  unit: values?.unit || "",
  storageType: values?.storageType || "",
  minStockThreshold: Number(values?.minStockThreshold || 0),
  isActive: values?.isActive !== false,
});

const validateBusinessText = ({
  fieldLabel,
  required = false,
  maxLength,
  allowedChars = TEXT_ALLOWED_CHARS,
}) => ({
  validator: (_, value) => {
    const text = normalizeText(value);

    if (!text) {
      return required
        ? Promise.reject(new Error(`${fieldLabel} is required`))
        : Promise.resolve();
    }

    if (maxLength && text.length > maxLength) {
      return Promise.reject(
        new Error(`${fieldLabel} must be ${maxLength} characters or less`),
      );
    }

    if (!TEXT_HAS_LETTER.test(text)) {
      return Promise.reject(
        new Error(`${fieldLabel} must contain at least one letter`),
      );
    }

    if (!allowedChars.test(text)) {
      return Promise.reject(
        new Error(`${fieldLabel} can only contain letters and spaces`),
      );
    }

    return Promise.resolve();
  },
});

const validateThreshold = (currentStock = 0) => ({
  validator: (_, value) => {
    if (value === undefined || value === null || value === "") {
      return Promise.reject(new Error("Minimum stock threshold is required"));
    }

    const numberValue = Number(value);
    if (!Number.isFinite(numberValue)) {
      return Promise.reject(
        new Error("Minimum stock threshold must be a valid number"),
      );
    }

    if (numberValue < 0) {
      return Promise.reject(
        new Error("Minimum stock threshold cannot be negative"),
      );
    }

    if (numberValue > MAX_MIN_STOCK_THRESHOLD) {
      return Promise.reject(
        new Error(
          `Minimum stock threshold must be ${MAX_MIN_STOCK_THRESHOLD} or less`,
        ),
      );
    }

    if (numberValue > currentStock) {
      return Promise.reject(
        new Error("Minimum stock threshold cannot be greater than current stock"),
      );
    }

    if (!Number.isInteger(numberValue * 100)) {
      return Promise.reject(
        new Error("Minimum stock threshold can have at most 2 decimals"),
      );
    }

    return Promise.resolve();
  },
});

export default function IngredientFormModal({
  open,
  mode = "create",
  initialValues,
  categories = [],
  categoryLoading = false,
  loading,
  onCancel,
  onSubmit,
}) {
  const [form] = Form.useForm();
  const currentStock = Number(initialValues?.currentStock || 0);
  const maxThreshold = Math.min(MAX_MIN_STOCK_THRESHOLD, currentStock);

  const fillForm = () => {
    form.resetFields();
    form.setFieldsValue(normalizeInitialValues(initialValues));
  };

  useEffect(() => {
    if (!open) return;

    fillForm();
  }, [initialValues, open]);

  const categoryOptions = categories
    .map((category) => ({
      label: category.name || "Unnamed Category",
      value: category._id || category.id,
    }))
    .filter((option) => option.value);

  const handleOk = async () => {
    const values = await form.validateFields();

    await onSubmit({
      ...values,
      name: normalizeText(values.name),
      unit: normalizeText(values.unit),
      storageType: normalizeText(values.storageType) || undefined,
      categoryId: values.categoryId || null,
      minStockThreshold: Number(values.minStockThreshold || 0),
    });
  };

  return (
    <Modal
      title={mode === "create" ? "Create Ingredient" : "Update Ingredient"}
      open={open}
      confirmLoading={loading}
      onCancel={onCancel}
      onOk={handleOk}
      okText={mode === "create" ? "Create" : "Update"}
      destroyOnClose
      forceRender
      afterOpenChange={(visible) => {
        if (visible) fillForm();
        else form.resetFields();
      }}
    >
      <Form form={form} layout="vertical" preserve={false}>
        <Form.Item
          name="name"
          label="Ingredient Name"
          rules={[
            validateBusinessText({
              fieldLabel: "Ingredient name",
              required: true,
              maxLength: 120,
            }),
          ]}
        >
          <Input placeholder="Example: Chicken breast" maxLength={120} showCount />
        </Form.Item>

        <Form.Item
          name="categoryId"
          label="Category"
        >
          <Select
            allowClear
            loading={categoryLoading}
            options={categoryOptions}
            placeholder="Select category"
          />
        </Form.Item>

        <Form.Item
          name="unit"
          label="Unit"
          rules={[
            validateBusinessText({
              fieldLabel: "Unit",
              required: true,
              maxLength: 30,
            }),
          ]}
        >
          <Input placeholder="Example: kg, g, liter, pack" maxLength={30} showCount />
        </Form.Item>

        <Form.Item
          name="storageType"
          label="Storage Type"
          rules={[
            validateBusinessText({
              fieldLabel: "Storage type",
              maxLength: 50,
            }),
          ]}
        >
          <Input placeholder="Example: Frozen, Chilled, Dry" maxLength={50} showCount />
        </Form.Item>

        <Form.Item
          name="minStockThreshold"
          label="Minimum Stock Threshold"
          rules={[
            validateThreshold(currentStock),
          ]}
        >
          <InputNumber
            className="w-full"
            min={0}
            max={maxThreshold}
            precision={2}
          />
        </Form.Item>

        <Form.Item name="isActive" label="Active" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}
