import React, { useEffect } from "react";
import { Form, Input, Modal, Switch } from "antd";

export default function SupplierFormModal({
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
          contactName: "",
          phone: "",
          address: "",
          note: "",
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
      title={mode === "create" ? "Create Supplier" : "Update Supplier"}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText={mode === "create" ? "Create" : "Save Changes"}
      confirmLoading={loading}
      destroyOnClose
      width={540}
    >
      <Form form={form} layout="vertical" className="pt-4">
        <Form.Item
          name="name"
          label="Supplier Name"
          rules={[
            { required: true, message: "Please enter supplier name" },
            { whitespace: true, message: "Supplier name cannot be empty" },
            { min: 2, message: "Supplier name must be at least 2 characters" },
            { max: 120, message: "Supplier name must not exceed 120 characters" },
          ]}
        >
          <Input placeholder="e.g. Fresh Farm Co." maxLength={120} />
        </Form.Item>

        <Form.Item
          name="contactName"
          label="Contact Person"
          rules={[
            {
              pattern: /^[\p{L}\s'.,\-]{2,80}$/u,
              message: "Contact name must contain only letters, spaces and basic punctuation",
            },
          ]}
        >
          <Input placeholder="e.g. Nguyen Van A" maxLength={80} />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Phone Number"
          normalize={(value) => (value ? value.replace(/\D/g, "") : "")}
          rules={[
            {
              pattern: /^[0-9]{9,15}$/,
              message: "Phone number must contain 9-15 digits",
            },
          ]}
        >
          <Input placeholder="e.g. 0901234567" maxLength={15} />
        </Form.Item>

        <Form.Item name="address" label="Address">
          <Input.TextArea
            placeholder="Full address of the supplier"
            rows={3}
            maxLength={240}
            showCount
          />
        </Form.Item>

        <Form.Item name="note" label="Note">
          <Input.TextArea
            placeholder="Internal notes about this supplier"
            rows={3}
            maxLength={500}
            showCount
          />
        </Form.Item>

        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
          <Form.Item
            name="isActive"
            label="Active Supplier"
            valuePropName="checked"
            className="mb-0"
          >
            <Switch />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
