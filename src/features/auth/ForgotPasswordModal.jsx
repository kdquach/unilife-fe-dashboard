import React, { useEffect, useState } from "react";
import {
  ArrowLeftOutlined,
  CheckCircleFilled,
  LockOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { Button, Form, Input, Modal, Typography } from "antd";
import { notify } from "../../utils/notify";
import { authService } from "./authService";

const RESEND_DELAY_SECONDS = 60;

export default function ForgotPasswordModal({ open, onClose, onResetSuccess }) {
  const [emailForm] = Form.useForm();
  const [resetForm] = Form.useForm();
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!open) return undefined;

    setStep("email");
    setEmail("");
    setSecondsLeft(0);
    emailForm.resetFields();
    resetForm.resetFields();
    return undefined;
  }, [emailForm, open, resetForm]);

  useEffect(() => {
    if (!open || step !== "reset" || secondsLeft <= 0) return undefined;

    const timerId = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [open, secondsLeft, step]);

  const handleRequestOtp = async ({ email: submittedEmail }) => {
    const normalizedEmail = submittedEmail.trim().toLowerCase();
    setIsSubmitting(true);
    try {
      await authService.requestPasswordReset(normalizedEmail);
      setEmail(normalizedEmail);
      setStep("reset");
      setSecondsLeft(RESEND_DELAY_SECONDS);
      notify.success(
        "Verification code sent",
        "If the staff email is valid, a password reset code has been sent.",
      );
    } catch (error) {
      notify.error("Unable to send verification code", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async ({ otp, newPassword }) => {
    setIsSubmitting(true);
    try {
      await authService.resetPassword({ email, otp, newPassword });
      setStep("success");
    } catch (error) {
      notify.error("Unable to reset password", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      await authService.resendPasswordResetOtp(email);
      setSecondsLeft(RESEND_DELAY_SECONDS);
      notify.success("A new code has been sent", "Please check your inbox.");
    } catch (error) {
      notify.error("Unable to resend verification code", error.message);
    } finally {
      setIsResending(false);
    }
  };

  const handleDone = () => {
    onResetSuccess(email);
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={460}
      className="forgot-password-modal"
      destroyOnHidden
    >
      <div className="forgot-password-content">
        {step === "email" && (
          <>
            <div className="auth-modal-icon">
              <MailOutlined />
            </div>
            <Typography.Title level={3}>Forgot password?</Typography.Title>
            <Typography.Paragraph className="auth-modal-description">
              Enter your staff email and we will send you a verification code.
            </Typography.Paragraph>

            <div className="auth-modal-role-notice">
              <SafetyCertificateOutlined />
              Password recovery here is only available to canteen staff and
              managers. Customer accounts are not eligible.
            </div>

            <Form form={emailForm} onFinish={handleRequestOtp}>
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
                  placeholder="Staff email address"
                  aria-label="Staff email address"
                  autoComplete="email"
                  autoFocus
                />
              </Form.Item>
              <Button
                htmlType="submit"
                type="primary"
                size="large"
                loading={isSubmitting}
                block
                className="auth-modal-submit"
              >
                Send verification code
              </Button>
            </Form>
          </>
        )}

        {step === "reset" && (
          <>
            <button
              type="button"
              className="auth-back-button"
              onClick={() => setStep("email")}
            >
              <ArrowLeftOutlined /> Use another email
            </button>
            <div className="auth-modal-icon">
              <SafetyCertificateOutlined />
            </div>
            <Typography.Title level={3}>Check your email</Typography.Title>
            <Typography.Paragraph className="auth-modal-description">
              Enter the code sent to <strong>{email}</strong>. The code expires
              in 10 minutes.
            </Typography.Paragraph>

            <Form form={resetForm} onFinish={handleResetPassword}>
              <Form.Item
                name="otp"
                rules={[
                  { required: true, message: "Please enter the verification code" },
                  { len: 6, message: "The verification code has 6 digits" },
                ]}
              >
                <Input.OTP length={6} size="large" inputMode="numeric" />
              </Form.Item>
              <Form.Item
                name="newPassword"
                rules={[
                  { required: true, message: "Please enter a new password" },
                  { min: 8, message: "Password must contain at least 8 characters" },
                ]}
              >
                <Input.Password
                  size="large"
                  prefix={<LockOutlined />}
                  placeholder="New password"
                  aria-label="New password"
                  autoComplete="new-password"
                />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                dependencies={["newPassword"]}
                rules={[
                  { required: true, message: "Please confirm your new password" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("The passwords do not match"));
                    },
                  }),
                ]}
              >
                <Input.Password
                  size="large"
                  prefix={<LockOutlined />}
                  placeholder="Confirm new password"
                  aria-label="Confirm new password"
                  autoComplete="new-password"
                />
              </Form.Item>
              <Button
                htmlType="submit"
                type="primary"
                size="large"
                loading={isSubmitting}
                block
                className="auth-modal-submit"
              >
                Reset password
              </Button>
            </Form>

            <div className="auth-resend-row">
              <span>Did not receive the code?</span>
              <Button
                type="link"
                onClick={handleResendOtp}
                loading={isResending}
                disabled={secondsLeft > 0}
              >
                {secondsLeft > 0 ? `Resend in ${secondsLeft}s` : "Resend code"}
              </Button>
            </div>
          </>
        )}

        {step === "success" && (
          <div className="auth-success-content">
            <div className="auth-success-icon">
              <CheckCircleFilled />
            </div>
            <Typography.Title level={3}>Password reset successful</Typography.Title>
            <Typography.Paragraph className="auth-modal-description">
              You can now log in to the dashboard with your new password.
            </Typography.Paragraph>
            <Button
              type="primary"
              size="large"
              block
              className="auth-modal-submit"
              onClick={handleDone}
            >
              Back to login
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
