import React, { useState } from "react";
import { Layout } from "antd";
import { Outlet } from "react-router-dom";

import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";

const { Content } = Layout;

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout className="min-h-screen">
      <DashboardSidebar collapsed={collapsed} />

      <Layout
        className={
          collapsed
            ? "ml-[86px]"
            : "ml-[270px]"
        }
      >
        <DashboardHeader
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />

        <Content className="min-h-[calc(100vh-80px)] p-6">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
