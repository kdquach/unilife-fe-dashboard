import React from "react";
import {
  AppstoreOutlined,
  BellOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TeamOutlined,
  UserOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Dropdown, Layout, Menu, Typography } from "antd";
import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import logoLg from "../assets/logo-lg.png";
import logoMd from "../assets/logo-md.png";
import { useAuth } from "../features/auth/AuthContext";

const { Header, Sider, Content } = Layout;

const menuItems = [
  {
    key: "/",
    icon: <AppstoreOutlined />,
    label: <Link to="/">Overview</Link>,
  },
  {
    key: "/users",
    icon: <TeamOutlined />,
    label: <Link to="/users">User Management</Link>,
  },
  {
    key: "/orders",
    icon: <ShoppingCartOutlined />,
    label: <Link to="/orders">Orders</Link>,
  },
];

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Layout className="min-h-screen">
      <Sider
        width={270}
        collapsedWidth={86}
        collapsed={collapsed}
        className="!fixed !left-0 !top-0 !z-40 h-screen overflow-auto border-r border-slate-100 !bg-white"
        theme="light"
      >
        <div className="flex h-20 items-center justify-center border-b border-slate-100 px-4">
          <img
            src={collapsed ? logoMd : logoLg}
            alt="UniLife"
            className={
              collapsed ? "h-11 w-11 object-contain" : "h-12 object-contain"
            }
          />
        </div>
        <div className="px-3 py-5">
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            className="border-none"
          />
        </div>
      </Sider>

      <Layout className={collapsed ? "ml-[86px]" : "ml-[270px]"}>
        <Header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-100 !bg-white px-6">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              size="large"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
            />
            <div>
              <Typography.Text className="text-xs uppercase tracking-[0.25em] text-unilife">
                Admin Dashboard
              </Typography.Text>
              <Typography.Title level={4} className="!mb-0 !mt-1">
                UniLife Management
              </Typography.Title>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button shape="circle" icon={<BellOutlined />} />
            <Dropdown
              menu={{
                items: [
                  {
                    key: "profile",
                    icon: <UserOutlined />,
                    label: user?.fullName || "Admin",
                  },
                  { type: "divider" },
                  {
                    key: "logout",
                    icon: <LogoutOutlined />,
                    label: "Logout",
                    danger: true,
                    onClick: handleLogout,
                  },
                ],
              }}
            >
              <button className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2">
                <Avatar className="bg-unilife">
                  {user?.fullName?.[0] || "A"}
                </Avatar>
                <div className="hidden text-left md:block">
                  <div className="text-sm font-semibold text-slate-900">
                    {user?.fullName || "Admin"}
                  </div>
                  <div className="text-xs text-slate-500">
                    {user?.role || "ADMIN"}
                  </div>
                </div>
              </button>
            </Dropdown>
          </div>
        </Header>
        <Content className="min-h-[calc(100vh-80px)] p-6">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
