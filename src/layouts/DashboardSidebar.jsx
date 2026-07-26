import React, { useMemo } from "react";
import { Layout, Menu } from "antd";
import { useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";

import logoLg from "../assets/logo-lg.png";
import logoMd from "../assets/logo-md.png";

import menuItems from "./menuItems";

const { Sider } = Layout;

const getFlatMenuItems = (items) => {
  const flat = [];
  const traverse = (list) => {
    for (const item of list) {
      if (item.children) {
        traverse(item.children);
      } else {
        flat.push(item);
      }
    }
  };
  traverse(items);
  return flat;
};

const filterMenuByRole = (items, role) => {
  const filtered = items
    .map((item) => {
      if (item.children) {
        const filteredChildren = filterMenuByRole(item.children, role);
        if (filteredChildren.length === 0) {
          return null;
        }
        return { ...item, children: filteredChildren };
      }

      const allowed = item.allowedRoles || ["ADMIN", "MANAGER"];
      if (allowed.includes(role)) {
        return item;
      }
      return null;
    })
    .filter(Boolean);

  if (role === "COUNTER_STAFF") {
    return getFlatMenuItems(filtered);
  }
  return filtered;
};

export default function DashboardSidebar({
  collapsed,
}) {
  const location = useLocation();
  const { user } = useAuth();
  const userRole = user?.role || "COUNTER_STAFF";

  const openKeys = [];
  const path = location.pathname;

  if (path.startsWith("/reports")) {
    openKeys.push("reports");
  } else if (path === "/food-categories" || path === "/foods" || path === "/menu-schedules") {
    openKeys.push("food-menu");
  } else if (path === "/orders" || path === "/kitchen-queue" || path === "/ratings") {
    openKeys.push("operations");
  } else if (
    path === "/ingredient-categories" ||
    path === "/ingredients" ||
    path === "/suppliers" ||
    path === "/inventory-transactions"
  ) {
    openKeys.push("inventory");
  } else if (path === "/users" || path === "/staffs") {
    openKeys.push("accounts");
  }

  const filteredMenuItems = useMemo(() => {
    return filterMenuByRole(menuItems, userRole);
  }, [userRole]);

  return (
    <Sider
      width={270}
      collapsedWidth={86}
      collapsed={collapsed}
      theme="light"
      className="!fixed !left-0 !top-0 !z-40 h-screen overflow-auto border-r border-slate-100 !bg-white"
    >
      <div className="flex h-20 items-center justify-center border-b border-slate-100 px-4">
        <img
          src={collapsed ? logoMd : logoLg}
          alt="UniLife"
          className={
            collapsed
              ? "h-11 w-11 object-contain"
              : "h-12 object-contain"
          }
        />
      </div>

      <div className="px-3 py-5">
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={openKeys}
          items={filteredMenuItems}
          className="border-none"
        />
      </div>
    </Sider>
  );
}