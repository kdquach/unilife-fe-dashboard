import React from "react";
import { createContext, useContext, useMemo, useState } from "react";
import { DASHBOARD_ALLOWED_ROLES } from "../../constants/roles";
import { authService } from "./authService";

const AuthContext = createContext(null);
const USER_STORAGE_KEY = "unilife_admin_user";

const getAuthPayload = (response) =>
  response?.data?.accessToken ? response.data : response?.data || response;

const hasDashboardAccess = (user) =>
  DASHBOARD_ALLOWED_ROLES.includes(String(user?.role || "").toUpperCase());

const clearStoredAuth = () => {
  localStorage.removeItem("unilife_access_token");
  localStorage.removeItem("unilife_refresh_token");
  localStorage.removeItem(USER_STORAGE_KEY);
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(USER_STORAGE_KEY);
      const storedUser = raw ? JSON.parse(raw) : null;
      if (!storedUser || !hasDashboardAccess(storedUser)) {
        clearStoredAuth();
        return null;
      }
      return storedUser;
    } catch {
      clearStoredAuth();
      return null;
    }
  });

  const login = async (payload) => {
    const response = await authService.login(payload);
    const data = getAuthPayload(response);
    if (!data?.accessToken || !data?.refreshToken || !data?.user) {
      throw new Error("Invalid login response. Please try again.");
    }
    localStorage.setItem("unilife_access_token", data.accessToken);
    localStorage.setItem("unilife_refresh_token", data.refreshToken);
    if (!hasDashboardAccess(data.user)) {
      await authService.logout();
      throw new Error("Customer accounts cannot access the dashboard.");
    }
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateUser = (partialUserData) => {
    setUser((prev) => {
      const updated = { ...prev, ...partialUserData };
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user) && hasDashboardAccess(user),
      login,
      logout,
      updateUser,
    }),
    [user],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
