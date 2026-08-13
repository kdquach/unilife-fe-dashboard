import React, { useMemo } from "react";
import { Layout, Menu, ConfigProvider } from "antd";
import { useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import { COLORS } from "../features/orders/utils/orderUtils.jsx";

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
        const { allowedRoles, ...rest } = item;
        return { ...rest, children: filteredChildren };
      }

      const allowed = item.allowedRoles || ["ADMIN", "MANAGER"];
      if (allowed.includes(role)) {
        const { allowedRoles, ...rest } = item;
        return rest;
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
      className="!fixed !left-0 !top-0 !z-40 h-screen overflow-auto !bg-white"
      style={{
        boxShadow: "2px 0 8px rgba(0, 0, 0, 0.04)",
        borderRight: "1px solid #f0f0f0",
      }}
    >
      <div
        className="flex items-center justify-center px-4"
        style={{
          height: 72,
          borderBottom: "1px solid #f0f0f0",
          background: "linear-gradient(135deg, #fff5f2 0%, #ffffff 100%)",
        }}
      >
        <img
          src={collapsed ? logoMd : logoLg}
          alt="UniLife"
          style={{
            height: collapsed ? 40 : 48,
            width: collapsed ? 40 : "auto",
            objectFit: "contain",
            transition: "all 0.3s ease",
          }}
        />
      </div>

      <div className="px-3 py-4">
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: COLORS.orange,
              borderRadius: 8,
              controlHeight: 40,
              fontSize: 14,
            },
            components: {
              Menu: {
                itemSelectedBg: `${COLORS.orange}1a`,
                itemSelectedColor: COLORS.orange,
                itemHoverBg: "#f5f5f5",
                itemBorderRadius: 8,
                itemMarginBottom: 4,
              },
            },
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            defaultOpenKeys={openKeys}
            items={filteredMenuItems}
            className="border-none"
          />
        </ConfigProvider>
      </div>
    </Sider>
  );
}
