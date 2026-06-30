import React, { useEffect } from "react";
import { Form, Input, Modal, Switch } from "antd";

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
    onSubmit(values);
  };

  return (
    <Modal
      title={mode === "create" ? "Create Food Category" : "Update Food Category"}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText={mode === "create" ? "Create" : "Save changes"}
      confirmLoading={loading}
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="pt-4">
        <Form.Item
          name="name"
          label="Name"
          rules={[
            { required: true, message: "Please enter category name" },
            { whitespace: true, message: "Category name cannot be empty" },
          ]}
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
