import React from "react";
import {
  AppstoreOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
  TagsOutlined,
  CalendarOutlined,
  DatabaseOutlined,
  HistoryOutlined,
  InboxOutlined,
  AuditOutlined,
  ShopOutlined,
  OrderedListOutlined,
  FileTextOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

import { Link } from "react-router-dom";

const menuItems = [
  {
    key: "/",
    icon: <AppstoreOutlined />,
    label: <Link to="/">Overview</Link>,
  },

  // ================= USERS =================
  {
    key: "users",
    icon: <TeamOutlined />,
    label: "Users",
    children: [
      {
        key: "/users",
        label: <Link to="/users">User Management</Link>,
      },
      {
        key: "/staffs",
        label: <Link to="/staffs">Staff Management</Link>,
      },
    ],
  },

  // ================= ORDERS =================
  {
    key: "orders",
    icon: <ShoppingCartOutlined />,
    label: "Orders",
    children: [
      {
        key: "/orders",
        label: <Link to="/orders">Order Management</Link>,
      },
      {
        key: "/kitchen-queue",
        label: <Link to="/kitchen-queue">Kitchen Queue</Link>,
      },
      {
        key: "/menu-schedules",
        label: <Link to="/menu-schedules">Menu Schedules</Link>,
      },
    ],
  },

  // ================= INVENTORY =================
  {
    key: "inventory",
    icon: <DatabaseOutlined />,
    label: "Inventory",
    children: [
      {
        key: "/food-categories",
        icon: <TagsOutlined />,
        label: (
          <Link to="/food-categories">
            Food Categories
          </Link>
        ),
      },
      {
        key: "/ingredient-categories",
        icon: <DatabaseOutlined />,
        label: (
          <Link to="/ingredient-categories">
            Ingredient Categories
          </Link>
        ),
      },
      {
        key: "/ingredients",
        icon: <InboxOutlined />,
        label: <Link to="/ingredients">Ingredients</Link>,
      },
      {
        key: "/inventory-transactions",
        icon: <HistoryOutlined />,
        label: (
          <Link to="/inventory-transactions">
            Inventory Transactions
          </Link>
        ),
      },
      {
        key: "/suppliers",
        icon: <ShopOutlined />,
        label: <Link to="/suppliers">Suppliers</Link>,
      },
    ],
  },

  // ================= REPORTS =================
  {
    key: "reports",
    icon: <FileTextOutlined />,
    label: "Reports",
    children: [
      {
        key: "/reports/revenue",
        icon: <BarChartOutlined />,
        label: (
          <Link to="/reports/revenue">
            Revenue Report
          </Link>
        ),
      },
      {
        key: "/reports/peak-hour",
        icon: <ClockCircleOutlined />,
        label: (
          <Link to="/reports/peak-hour">
            Peak Hour Report
          </Link>
        ),
      },
    ],
  },

  // ================= SYSTEM =================
  {
    key: "/activity-logs",
    icon: <AuditOutlined />,
    label: <Link to="/activity-logs">Activity Logs</Link>,
  },
];

export default menuItems;