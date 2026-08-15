import React, { useEffect } from "react";
import { Form, Input, Modal, Switch } from "antd";

const validateSupplierName = () => ({
  validator: (_, value) => {
    const raw = String(value || "");
    const trimmed = raw.trim();

    if (!trimmed) {
      return Promise.reject(new Error("Please enter supplier name"));
    }

    if (trimmed.length < 2) {
      return Promise.reject(
        new Error("Supplier name must be at least 2 characters")
      );
    }

    if (trimmed.length > 120) {
      return Promise.reject(
        new Error("Supplier name must not exceed 120 characters")
      );
    }

    if (!/^[\p{L}\p{N}]+(?:\s+[\p{L}\p{N}]+)*$/u.test(trimmed)) {
      return Promise.reject(
        new Error("Supplier name cannot contain special characters")
      );
    }

    return Promise.resolve();
  },
});

const validateContactName = () => ({
  validator: (_, value) => {
    const raw = String(value || "");
    const trimmed = raw.trim();

    if (!trimmed) {
      return Promise.reject(new Error("Please enter contact person name"));
    }

    if (trimmed.length < 2) {
      return Promise.reject(
        new Error("Contact person name must be at least 2 characters")
      );
    }

    if (trimmed.length > 80) {
      return Promise.reject(
        new Error("Contact person name must not exceed 80 characters")
      );
    }

    if (!/^[\p{L}]+(?:\s+[\p{L}]+)*$/u.test(trimmed)) {
      return Promise.reject(
        new Error("Contact person name cannot contain numbers or special characters")
      );
    }

    return Promise.resolve();
  },
});

const validatePhone = () => ({
  validator: (_, value) => {
    const raw = String(value || "");
    const phone = raw.trim();

    if (!phone) {
      return Promise.reject(new Error("Please enter phone number"));
    }

    if (!/^\d+$/.test(phone)) {
      return Promise.reject(new Error("Phone number must contain digits only"));
    }

    if (phone.length !== 10) {
      return Promise.reject(new Error("Phone number must be exactly 10 digits"));
    }

    if (!/^(03|05|07|08|09)\d{8}$/.test(phone)) {
      return Promise.reject(
        new Error("Phone number must be a valid Vietnamese mobile number (starting with 03, 05, 07, 08, 09)")
      );
    }

    return Promise.resolve();
  },
});

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
    onSubmit({
      ...values,
      name: values.name?.trim(),
      contactName: values.contactName?.trim(),
      phone: values.phone?.trim(),
      address: values.address?.trim(),
      note: values.note?.trim(),
    });
  };

  return (
    <Modal
      title={mode === "create" ? "Create Supplier" : "Update Supplier"}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText={mode === "create" ? "Create" : "Save Changes"}
      confirmLoading={loading}
      destroyOnHidden
      width={540}
      centered
      styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
    >
      <Form form={form} layout="vertical" className="pt-4">
        <Form.Item
          name="name"
          label="Supplier Name"
          rules={[validateSupplierName()]}
        >
          <Input placeholder="e.g. Fresh Farm Co." maxLength={120} showCount />
        </Form.Item>

        <Form.Item
          name="contactName"
          label="Contact Person"
          rules={[validateContactName()]}
        >
          <Input placeholder="e.g. Nguyen Van A" maxLength={80} showCount />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Phone Number"
          normalize={(value) => (value ? value.replace(/\D/g, "") : "")}
          rules={[validatePhone()]}
        >
          <Input placeholder="e.g. 0901234567" maxLength={10} showCount />
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
