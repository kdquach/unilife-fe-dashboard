import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "../AuthContext";
import { authService } from "../authService";

vi.mock("../authService");

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

describe("AuthContext & AuthProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should initialize unauthenticated if localStorage is empty", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("should restore authenticated session from valid stored admin user", () => {
    const storedUser = { _id: "admin-1", email: "admin@unilife.com", role: "ADMIN" };
    localStorage.setItem("unilife_admin_user", JSON.stringify(storedUser));
    localStorage.setItem("unilife_access_token", "valid-access-token");
    localStorage.setItem("unilife_refresh_token", "valid-refresh-token");

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toEqual(storedUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("should clear storage and reject customer role from dashboard", () => {
    const storedUser = { _id: "cust-1", email: "cust@unilife.com", role: "CUSTOMER" };
    localStorage.setItem("unilife_admin_user", JSON.stringify(storedUser));

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem("unilife_admin_user")).toBeNull();
  });

  it("should handle successful login flow and persist tokens", async () => {
    const adminUser = { _id: "admin-1", role: "ADMIN", email: "admin@unilife.com" };
    authService.login.mockResolvedValueOnce({
      data: {
        accessToken: "acc-123",
        refreshToken: "ref-123",
        user: adminUser,
      },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login({ email: "admin@unilife.com", password: "secretPassword" });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(adminUser);
    expect(localStorage.getItem("unilife_access_token")).toBe("acc-123");
    expect(localStorage.getItem("unilife_refresh_token")).toBe("ref-123");
  });

  it("should reject customer login attempts with an error message", async () => {
    const customerUser = { _id: "cust-1", role: "CUSTOMER", email: "cust@unilife.com" };
    authService.login.mockResolvedValueOnce({
      data: {
        accessToken: "acc-123",
        refreshToken: "ref-123",
        user: customerUser,
      },
    });
    authService.logout.mockResolvedValueOnce({});

    const { result } = renderHook(() => useAuth(), { wrapper });

    await expect(
      act(async () => {
        await result.current.login({ email: "cust@unilife.com", password: "secretPassword" });
      })
    ).rejects.toThrow("Customer accounts cannot access the dashboard.");
  });

  it("should logout and clear state and storage", async () => {
    const adminUser = { _id: "admin-1", role: "MANAGER" };
    localStorage.setItem("unilife_admin_user", JSON.stringify(adminUser));
    localStorage.setItem("unilife_access_token", "token-123");

    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.logout();
    });

    expect(authService.logout).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("should allow updating current user data and persist to storage", () => {
    const adminUser = { _id: "admin-1", role: "ADMIN", fullName: "Admin User" };
    localStorage.setItem("unilife_admin_user", JSON.stringify(adminUser));

    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.updateUser({ fullName: "Updated Admin Name" });
    });

    expect(result.current.user.fullName).toBe("Updated Admin Name");
    expect(JSON.parse(localStorage.getItem("unilife_admin_user")).fullName).toBe("Updated Admin Name");
  });
});
