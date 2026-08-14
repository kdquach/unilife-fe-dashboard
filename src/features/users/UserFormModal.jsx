import React from "react";
import { Form, Input, Modal, Select, Switch } from "antd";
import { useEffect } from "react";
import { USER_ROLES } from "../../constants/roles";

const TEXT_HAS_LETTER = /\p{L}/u;
const TEXT_ONLY_LETTERS_SPACES_AND_NUMBERS = /^[\p{L}\s\d]+$/u;

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ");

const validateBusinessText = ({
  fieldLabel,
  required = false,
  maxLength,
  allowedChars = TEXT_ONLY_LETTERS_SPACES_AND_NUMBERS,
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
        new Error(`${fieldLabel} can only contain letters, spaces, and numbers`),
      );
    }

    return Promise.resolve();
  },
});

const validateFullName = () => ({
  validator: (_, value) => {
    const fullName = String(value || "").trim();

    if (!fullName) {
      return Promise.reject(new Error("Full Name is required"));
    }

    if (fullName === "") {
      return Promise.reject(new Error("Full Name cannot be empty"));
    }

    if (fullName.length < 2) {
      return Promise.reject(new Error("Full Name must be at least 2 characters"));
    }

    if (fullName.length > 100) {
      return Promise.reject(new Error("Full Name must not exceed 100 characters"));
    }

    // Không cho khoảng trắng đầu/cuối
    if (value !== value.trim()) {
      return Promise.reject(new Error("Full Name must contain at least first name and last name, using letters and spaces only"));
    }

    // Không cho nhiều khoảng trắng liên tiếp
    if (/\s{2,}/.test(fullName)) {
      return Promise.reject(new Error("Full Name must contain at least first name and last name, using letters and spaces only"));
    }

    // Phải có ít nhất first name và last name, chỉ letters (bao gồm tiếng Việt)
    if (!/^[A-Za-zÀ-ỹĐđ]+(?:\s+[A-Za-zÀ-ỹĐđ]+)+$/.test(fullName)) {
      return Promise.reject(new Error("Full Name must contain at least first name and last name, using letters and spaces only"));
    }

    return Promise.resolve();
  },
});

const validatePhone = () => ({
  validator: (_, value) => {
    const phone = String(value || "").trim();

    if (!phone) {
      return Promise.reject(new Error("Phone is required"));
    }

    if (phone === "") {
      return Promise.reject(new Error("Phone cannot be empty"));
    }

    // Chỉ cho phép số
    if (!/^\d+$/.test(phone)) {
      return Promise.reject(new Error("Phone must be a valid Vietnamese phone number"));
    }

    // Số điện thoại Việt Nam: 10 chữ số
    if (phone.length !== 10) {
      return Promise.reject(new Error("Phone must be a valid Vietnamese phone number"));
    }

    // Phải bắt đầu bằng 03, 05, 07, 08 hoặc 09
    if (!/^(03|05|07|08|09)\d{8}$/.test(phone)) {
      return Promise.reject(new Error("Phone must be a valid Vietnamese phone number"));
    }

    return Promise.resolve();
  },
});

const validatePassword = () => ({
  validator: (_, value) => {
    if (!value) {
      return Promise.reject(new Error("Password is required"));
    }

    if (value.trim() === "") {
      return Promise.reject(new Error("Password cannot be empty"));
    }

    if (value.length < 8) {
      return Promise.reject(new Error("Password must be at least 8 characters"));
    }

    if (value.length > 128) {
      return Promise.reject(new Error("Password must not exceed 128 characters"));
    }

    if (/\s/.test(value)) {
      return Promise.reject(new Error("Password must not contain spaces"));
    }

    if (!/[A-Z]/.test(value)) {
      return Promise.reject(new Error("Password must contain at least one uppercase letter"));
    }

    if (!/[a-z]/.test(value)) {
      return Promise.reject(new Error("Password must contain at least one lowercase letter"));
    }

    if (!/[0-9]/.test(value)) {
      return Promise.reject(new Error("Password must contain at least one number"));
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
      return Promise.reject(new Error("Password must contain at least one special character"));
    }

    return Promise.resolve();
  },
});

const validateEmail = () => ({
  validator: (_, value) => {
    const email = String(value || "").trim().toLowerCase();

    if (!email) {
      return Promise.reject(new Error("Email is required"));
    }

    if (email === "") {
      return Promise.reject(new Error("Email cannot be empty"));
    }

    if (email.length > 254) {
      return Promise.reject(new Error("Email must not exceed 254 characters"));
    }

    // Không cho khoảng trắng
    if (/\s/.test(email)) {
      return Promise.reject(new Error("Email must be a valid email address"));
    }

    // Email phải có đúng 1 ký tự @
    const atCount = (email.match(/@/g) || []).length;
    if (atCount !== 1) {
      return Promise.reject(new Error("Email must be a valid email address"));
    }

    const [localPart, domain] = email.split("@");

    // Local part và domain không được rỗng
    if (!localPart || !domain) {
      return Promise.reject(new Error("Email must be a valid email address"));
    }

    // Không cho dấu . ở đầu/cuối local part
    if (localPart.startsWith(".") || localPart.endsWith(".")) {
      return Promise.reject(new Error("Email must be a valid email address"));
    }

    // Không cho ".."
    if (email.includes("..")) {
      return Promise.reject(new Error("Email must be a valid email address"));
    }

    // Local part cho phép: a-z A-Z 0-9 . _ % + - và các ký tự đặc biệt
    if (!/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(localPart)) {
      return Promise.reject(new Error("Email must be a valid email address"));
    }

    // Domain chỉ cho chữ, số, dấu - và .
    if (!/^[A-Za-z0-9.-]+$/.test(domain)) {
      return Promise.reject(new Error("Email must be a valid email address"));
    }

    // Domain không được bắt đầu/kết thúc bằng .
    if (domain.startsWith(".") || domain.endsWith(".")) {
      return Promise.reject(new Error("Email must be a valid email address"));
    }

    // Domain không được bắt đầu/kết thúc bằng -
    if (domain.startsWith("-") || domain.endsWith("-")) {
      return Promise.reject(new Error("Email must be a valid email address"));
    }

    // Domain phải có ít nhất 1 dấu .
    if (!domain.includes(".")) {
      return Promise.reject(new Error("Email must be a valid email address"));
    }

    // Kiểm tra từng domain segment
    const domainParts = domain.split(".");
    if (domainParts.some((part) => !part || part.startsWith("-") || part.endsWith("-"))) {
      return Promise.reject(new Error("Email must be a valid email address"));
    }

    // TLD phải có ít nhất 2 ký tự
    const tld = domainParts[domainParts.length - 1];
    if (!/^[A-Za-z]{2,}$/.test(tld)) {
      return Promise.reject(new Error("Email must be a valid email address"));
    }

    return Promise.resolve();
  },
});

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
    const payload = {
      ...values,
      fullName: String(values.fullName || "").trim(),
    };
    onSubmit(payload);
  };

  return (
    <Modal
      title={mode === "create" ? "Create User" : "Update User"}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText={mode === "create" ? "Create" : "Save changes"}
      confirmLoading={loading}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" className="pt-4">
        <Form.Item
          name="fullName"
          label="Full name"
          rules={[validateFullName()]}
        >
          <Input placeholder="Nguyen Van A" maxLength={100} showCount />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[validateEmail()]}
        >
          <Input placeholder="user@unilife.local" disabled={mode === "edit"} maxLength={254} />
        </Form.Item>

        {mode === "create" && (
          <Form.Item
            name="password"
            label="Password"
            rules={[validatePassword()]}
          >
            <Input.Password placeholder="Enter password" maxLength={128} />
          </Form.Item>
        )}

        <Form.Item
          name="phone"
          label="Phone"
          rules={[validatePhone()]}
        >
          <Input placeholder="0900000000" maxLength={10} />
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
