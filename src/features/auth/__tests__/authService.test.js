import { beforeEach, describe, expect, it, vi } from "vitest";

const { post } = vi.hoisted(() => ({ post: vi.fn() }));

vi.mock("../../../services/apiClient", () => ({
  default: { post },
}));

import { authService } from "../authService";

describe("authService password reset", () => {
  beforeEach(() => {
    post.mockReset();
  });

  it("requests a password reset OTP", async () => {
    post.mockResolvedValue({ data: null });

    await authService.requestPasswordReset("staff@unilife.vn");

    expect(post).toHaveBeenCalledWith("/auth/forgot-password", {
      email: "staff@unilife.vn",
      audience: "DASHBOARD",
    });
  });

  it("requests a replacement OTP", async () => {
    post.mockResolvedValue({ data: null });

    await authService.resendPasswordResetOtp("staff@unilife.vn");

    expect(post).toHaveBeenCalledWith("/auth/resend-forgot-password-otp", {
      email: "staff@unilife.vn",
      audience: "DASHBOARD",
    });
  });

  it("submits the OTP and new password", async () => {
    post.mockResolvedValue({ data: null });
    const payload = {
      email: "staff@unilife.vn",
      otp: "123456",
      newPassword: "NewPassword@123",
    };

    await authService.resetPassword(payload);

    expect(post).toHaveBeenCalledWith("/auth/reset-password", {
      ...payload,
      audience: "DASHBOARD",
    });
  });
});
