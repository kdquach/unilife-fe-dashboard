import React, { useEffect } from "react";
import { Modal, Form, Input, Switch } from "antd";

const validateIngredientCategoryName = () => ({
  validator: (_, value) => {
    const raw = String(value || "");
    const trimmed = raw.trim();

    if (!trimmed) {
      return Promise.reject(new Error("Please enter ingredient category name"));
    }

    if (trimmed.length < 2) {
      return Promise.reject(
        new Error("Ingredient category name must be at least 2 characters"),
      );
    }

    if (trimmed.length > 80) {
      return Promise.reject(
        new Error("Ingredient category name cannot exceed 80 characters"),
      );
    }

    if (!/^[\p{L}]+(?:\s+[\p{L}]+)*$/u.test(trimmed)) {
      return Promise.reject(
        new Error(
          "Ingredient category name cannot contain numbers or special characters",
        ),
      );
    }

    return Promise.resolve();
  },
});

export default function IngredientCategoryFormModal({
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
          isActive: true,
        },
      );
    }
  }, [open, initialValues, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    onSubmit({
      ...values,
      name: values.name?.trim(),
    });
  };

  return (
    <Modal
      title={
        mode === "create"
          ? "Create Ingredient Category"
          : "Update Ingredient Category"
      }
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={loading}
      okText={mode === "create" ? "Create" : "Save changes"}
    >
      <Form layout="vertical" form={form} className="pt-2">
        <Form.Item
          label="Ingredient Category Name"
          name="name"
          rules={[validateIngredientCategoryName()]}
        >
          <Input
            placeholder="e.g. Vegetables, Spices, Meat"
            maxLength={80}
            showCount
          />
        </Form.Item>

        <Form.Item label="Active" name="isActive" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}
