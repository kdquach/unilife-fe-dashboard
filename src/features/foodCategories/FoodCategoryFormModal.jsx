import React, { useEffect } from "react";
import { Form, Input, Modal, Switch } from "antd";

const validateCategoryName = () => ({
  validator: (_, value) => {
    const raw = String(value || "");
    const trimmed = raw.trim();

    if (!trimmed) {
      return Promise.reject(new Error("Please enter category name"));
    }

    if (trimmed.length < 2) {
      return Promise.reject(new Error("Category name must be at least 2 characters"));
    }

    if (trimmed.length > 80) {
      return Promise.reject(new Error("Category name cannot exceed 80 characters"));
    }

    if (!/^[\p{L}]+(?:\s+[\p{L}]+)*$/u.test(trimmed)) {
      return Promise.reject(
        new Error("Category name cannot contain numbers or special characters")
      );
    }

    return Promise.resolve();
  },
});

export default function FoodCategoryFormModal({
  open,
  mode = "create",
  initialValues,
  loading,
  onCancel,
  onSubmit,
}) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue(
        initialValues || {
          name: "",
          description: "",
          isActive: true,
        },
      );
    }
  }, [form, initialValues, open]);

  const handleOk = async () => {
    const values = await form.validateFields();
    onSubmit({
      ...values,
      name: values.name?.trim(),
      description: values.description?.trim(),
    });
  };

  return (
    <Modal
      title={mode === "create" ? "Create Food Category" : "Update Food Category"}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText={mode === "create" ? "Create" : "Save changes"}
      confirmLoading={loading}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" className="pt-4">
        <Form.Item
          name="name"
          label="Name"
          rules={[validateCategoryName()]}
        >
          <Input placeholder="Rice Meals" maxLength={80} showCount />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea
            placeholder="Short note for this category"
            rows={4}
            maxLength={240}
            showCount
          />
        </Form.Item>
        <Form.Item
          name="isActive"
          label="Active category"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}
