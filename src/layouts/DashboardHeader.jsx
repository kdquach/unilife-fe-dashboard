import React from "react";
import {
  BellOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from "@ant-design/icons";

import {
  Avatar,
  Button,
  Dropdown,
  Layout,
  Typography,
} from "antd";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import { getImageUrl } from "../utils/image";

const { Header } = Layout;

export default function DashboardHeader({
  collapsed,
  setCollapsed,
}) {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-100 !bg-white px-6">
      <div className="flex items-center gap-4 h-full">
        <Button
          type="text"
          size="large"
          icon={
            collapsed ? (
              <MenuUnfoldOutlined />
            ) : (
              <MenuFoldOutlined />
            )
          }
          onClick={() =>
            setCollapsed(!collapsed)
          }
        />

        <div className="flex h-full flex-col justify-center">
          <Typography.Text className="text-xs uppercase tracking-[0.25em] text-unilife">
            Admin Dashboard
          </Typography.Text>

          <Typography.Title
            level={4}
            style={{ margin: 0 }}
          >
            UniLife Management
          </Typography.Title>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          shape="circle"
          icon={<BellOutlined />}
        />

        <Dropdown
          menu={{
            items: [
              {
                key: "profile",
                icon: <UserOutlined />,
                label: "Profile",
                onClick: () => navigate("/profile"),
              },
              {
                type: "divider",
              },
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
          <button className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2 hover:bg-slate-100 transition-colors cursor-pointer">
            <Avatar
              src={user?.avatar || user?.avatarUrl ? getImageUrl(user.avatar || user.avatarUrl) : undefined}
              className="bg-unilife font-bold"
            >
              {!(user?.avatar || user?.avatarUrl) && (user?.fullName?.[0]?.toUpperCase() || "A")}
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
  );
}