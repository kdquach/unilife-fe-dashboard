import React, { useEffect } from "react";
import { Form, Input, InputNumber, Modal, Select, Switch } from "antd";

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
  description: values?.description || "",
  imageUrl: values?.imageUrl || "",
  price: Number(values?.price || 0),
  stockQuantity:
    values?.stockQuantity === null || values?.stockQuantity === undefined
      ? null
      : Number(values.stockQuantity),
  isMenuItem: values?.isMenuItem === true,
  isActive: values?.isActive !== false,
});

export default function FoodFormModal({
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
      description: normalizeText(values.description),
      imageUrl: normalizeText(values.imageUrl),
      categoryId: values.categoryId || null,
      price: Number(values.price || 0),
      stockQuantity:
        values.stockQuantity === null || values.stockQuantity === undefined
          ? null
          : Number(values.stockQuantity),
      isMenuItem: Boolean(values.isMenuItem),
      isActive: Boolean(values.isActive),
    });
  };

  return (
    <Modal
      title={mode === "create" ? "Create Food" : "Update Food"}
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
          label="Food Name"
          rules={[
            { required: true, message: "Food name is required" },
            { max: 120, message: "Food name must be 120 characters or less" },
          ]}
        >
          <Input placeholder="Example: Grilled chicken rice" maxLength={120} />
        </Form.Item>

        <Form.Item name="categoryId" label="Category">
          <Select
            allowClear
            showSearch
            loading={categoryLoading}
            options={categoryOptions}
            placeholder="Select category"
            optionFilterProp="label"
          />
        </Form.Item>

        <Form.Item
          name="price"
          label="Price"
          rules={[{ required: true, message: "Food price is required" }]}
        >
          <InputNumber
            className="w-full"
            min={0}
            precision={0}
            addonAfter="VND"
          />
        </Form.Item>

        <Form.Item name="stockQuantity" label="Stock Quantity">
          <InputNumber className="w-full" min={0} precision={0} />
        </Form.Item>

        <Form.Item name="imageUrl" label="Image URL">
          <Input placeholder="/uploads/foods/example.jpg" maxLength={500} />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea rows={4} maxLength={500} showCount />
        </Form.Item>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Form.Item name="isMenuItem" label="Menu Schedule Item" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
