import React from "react";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { Button, Card, Checkbox, Form, Input, Typography, message } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import logoLg from "../assets/logo-lg.png";
import { useAuth } from "../features/auth/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleFinish = async (values) => {
    setIsSubmitting(true);
    try {
      await login(values);
      message.success("Login successfully");
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (error) {
      message.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top_left,#fff1ed,transparent_36%),linear-gradient(135deg,#fff,#f8fafc)]">
      <div className="hidden flex-1 items-center justify-center p-10 lg:flex">
        <div className="max-w-xl">
          <div className="mb-8 inline-flex rounded-3xl bg-white p-5 shadow-soft">
            <img src={logoLg} alt="UniLife" className="h-24 object-contain" />
          </div>
          <Typography.Title className="!text-5xl !leading-tight !text-slate-950">
            Manage your university canteen smarter.
          </Typography.Title>
          <Typography.Paragraph className="!mt-5 !text-lg !text-slate-500">
            Admin dashboard for user management: view users, filter roles,
            update staff/customer status and maintain account data.
          </Typography.Paragraph>
        </div>
      </div>

      <div className="flex w-full items-center justify-center p-6 lg:w-[520px]">
        <Card
          className="w-full max-w-md rounded-[28px] border-none shadow-soft"
          styles={{ body: { padding: 32 } }}
        >
          <div className="mb-8 text-center">
            <img
              src={logoLg}
              alt="UniLife"
              className="mx-auto mb-4 h-16 object-contain"
            />
            <Typography.Title level={2} className="!mb-2">
              Admin Login
            </Typography.Title>
            <Typography.Text className="text-slate-500">
              Sign in with an admin, manager, or staff account.
            </Typography.Text>
          </div>

          <Form
            form={form}
            layout="vertical"
            initialValues={{
              email: "admin@unilife.local",
              password: "Password@123",
              rememberMe: true,
            }}
            onFinish={handleFinish}
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true }, { type: "email" }]}
            >
              <Input
                size="large"
                prefix={<MailOutlined />}
                placeholder="admin@unilife.local"
              />
            </Form.Item>
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true }]}
            >
              <Input.Password
                size="large"
                prefix={<LockOutlined />}
                placeholder="Password@123"
              />
            </Form.Item>
            <Form.Item name="rememberMe" valuePropName="checked" className="!mb-6">
              <Checkbox>Remember me</Checkbox>
            </Form.Item>
            <Button
              htmlType="submit"
              type="primary"
              size="large"
              loading={isSubmitting}
              block
            >
              Login to Dashboard
            </Button>
          </Form>
        </Card>
      </div>
    </div>
  );
}
