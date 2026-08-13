import React from "react";
import {
  LockOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Checkbox, Form, Input, Typography } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import logoLg from "../assets/logo-lg.png";
import ForgotPasswordModal from "../features/auth/ForgotPasswordModal";
import { useAuth } from "../features/auth/AuthContext";
import { notify } from "../utils/notify";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = React.useState(false);

  const handleFinish = async (values) => {
    setIsSubmitting(true);
    try {
      await login(values);
      notify.success("Login successful");
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (error) {
      notify.error("Login failed", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetSuccess = (email) => {
    form.setFieldValue("email", email);
  };

  return (
    <main className="auth-page">
      <section className="auth-brand-panel">
        <div className="auth-brand-content">
          <img src={logoLg} alt="UniLife" className="auth-brand-logo" />
          <Typography.Title className="auth-brand-title">
            Welcome to the
            <br />
            UniLife Canteen!
          </Typography.Title>
          <Typography.Paragraph className="auth-brand-copy">
            A simpler way to manage daily canteen operations.
          </Typography.Paragraph>
        </div>
        <span className="auth-brand-circle auth-brand-circle-one" />
        <span className="auth-brand-circle auth-brand-circle-two" />
      </section>

      <section className="auth-form-section">
        <div className="auth-form-container">
          <div className="auth-mobile-brand">
            <img src={logoLg} alt="UniLife" />
          </div>

          <div className="auth-user-icon" aria-hidden="true">
            <UserOutlined />
          </div>

          <div className="auth-form-heading">
            <Typography.Title level={1}>Welcome back</Typography.Title>
            <Typography.Paragraph>
              Login below to get started.
            </Typography.Paragraph>
          </div>

          <Form
            form={form}
            requiredMark={false}
            initialValues={{ rememberMe: true }}
            onFinish={handleFinish}
            className="auth-login-form"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Please enter your email address" },
                { type: "email", message: "Please enter a valid email address" },
              ]}
            >
              <Input
                size="large"
                prefix={<MailOutlined />}
                placeholder="Email address"
                aria-label="Email address"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "Please enter your password" }]}
            >
              <Input.Password
                size="large"
                prefix={<LockOutlined />}
                placeholder="Password"
                aria-label="Password"
                autoComplete="current-password"
              />
            </Form.Item>

            <div className="auth-form-options">
              <Form.Item name="rememberMe" valuePropName="checked" noStyle>
                <Checkbox>Keep me signed in</Checkbox>
              </Form.Item>
              <Button
                type="link"
                className="auth-forgot-button"
                onClick={() => setIsForgotPasswordOpen(true)}
              >
                Forgot password?
              </Button>
            </div>

            <Button
              htmlType="submit"
              type="primary"
              size="large"
              loading={isSubmitting}
              block
              className="auth-submit-button"
            >
              Login
            </Button>
          </Form>

          <div className="auth-role-notice">
            <SafetyCertificateOutlined />
            <span>
              This dashboard is exclusively for canteen staff and managers.
            </span>
          </div>
        </div>
      </section>

      <ForgotPasswordModal
        open={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        onResetSuccess={handleResetSuccess}
      />
    </main>
  );
}
