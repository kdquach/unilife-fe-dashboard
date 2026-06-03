import React from "react";
import { createContext, useContext, useMemo, useState } from "react";
import { authService } from "./authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("unilife_admin_user");
    return raw ? JSON.parse(raw) : null;
  });

  const login = async (payload) => {
    const response = await authService.login(payload);
    const data = response.data;
    localStorage.setItem("unilife_access_token", data.accessToken);
    localStorage.setItem("unilife_refresh_token", data.refreshToken);
    localStorage.setItem("unilife_admin_user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), login, logout }),
    [user],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
