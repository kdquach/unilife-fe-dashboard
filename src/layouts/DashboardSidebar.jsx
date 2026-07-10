import React from "react";
import { Layout, Menu } from "antd";
import { useLocation } from "react-router-dom";

import logoLg from "../assets/logo-lg.png";
import logoMd from "../assets/logo-md.png";

import menuItems from "./menuItems";

const { Sider } = Layout;

export default function DashboardSidebar({
  collapsed,
}) {
  const location = useLocation();

  const openKeys = [];

  if (location.pathname.startsWith("/reports")) {
    openKeys.push("reports");
  }

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
          items={menuItems}
          className="border-none"
        />
      </div>
    </Sider>
  );
}