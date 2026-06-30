import React from "react";
import { Form, Input, Modal, Select, Switch } from "antd";
import { useEffect } from "react";
import { USER_ROLES } from "../../constants/roles";

export default function UserFormModal({
  open,
  mode = "create",
  initialValues,
  onCancel,
  onSubmit,
  loading,
}) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue(
        initialValues || {
          fullName: "",
          email: "",
          phone: "",
          role: "CUSTOMER",
          isActive: true,
        },
      );
    }
  }, [open, initialValues, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    onSubmit(values);
  };

  return (
    <Modal
      title={mode === "create" ? "Create User" : "Update User"}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText={mode === "create" ? "Create" : "Save changes"}
      confirmLoading={loading}
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="pt-4">
        <Form.Item
          name="fullName"
          label="Full name"
          rules={[{ required: true, message: "Please enter full name" }]}
        >
          <Input placeholder="Nguyen Van A" />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Please enter email" },
            { type: "email", message: "Invalid email" },
          ]}
        >
          <Input placeholder="user@unilife.local" disabled={mode === "edit"} />
        </Form.Item>

        {mode === "create" && (
          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: "Please enter password" },
              { min: 6, message: "Password must be at least 6 characters" },
            ]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>
        )}

        <Form.Item
          name="phone"
          label="Phone"
          rules={[{ required: true, message: "Please enter phone" }]}
        >
          <Input placeholder="0900000000" />
        </Form.Item>
        <Form.Item
          name="role"
          label="Role"
          rules={[{ required: true, message: "Please select role" }]}
        >
          <Select options={USER_ROLES} />
        </Form.Item>
        <Form.Item
          name="isActive"
          label="Active account"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}
