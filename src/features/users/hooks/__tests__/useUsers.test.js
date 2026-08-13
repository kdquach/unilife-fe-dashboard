import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useUsers } from "../useUsers";

const { updateUserRole, success, error } = vi.hoisted(() => ({
  updateUserRole: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock("../../userService", () => ({
  userService: {
    updateUserRole,
  },
}));

vi.mock("../../../../utils/notify", () => ({
  notify: { success, error },
}));

describe("useUsers role changes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates a user role through the user service", async () => {
    updateUserRole.mockResolvedValue({
      id: "user-1",
      role: "KITCHEN_STAFF",
    });
    const { result } = renderHook(() => useUsers());

    await act(async () => {
      await result.current.changeUserRole("user-1", "KITCHEN_STAFF");
    });

    expect(updateUserRole).toHaveBeenCalledWith("user-1", "KITCHEN_STAFF");
    expect(success).toHaveBeenCalledWith("User role changed successfully");
    expect(result.current.changingRoleId).toBeNull();
  });
});
