import {
  AppstoreOutlined,
  TeamOutlined,
  UserSwitchOutlined,
  ShoppingCartOutlined,
  TagsOutlined,
  CalendarOutlined,
  DatabaseOutlined,
  HistoryOutlined,
  InboxOutlined,
  AuditOutlined,
  ShopOutlined,
  OrderedListOutlined,
  CoffeeOutlined,
  FileTextOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  PieChartOutlined,
  FireOutlined,
  FolderOpenOutlined,
  ApartmentOutlined,
  ShoppingOutlined,
  StarOutlined
} from "@ant-design/icons";

import { Link } from "react-router-dom";

const menuItems = [
  {
    key: "/",
    icon: <AppstoreOutlined />,
    label: <Link to="/">Overview</Link>,
    allowedRoles: ["ADMIN", "MANAGER"],
  },

  // ================= FOOD & MENUS =================
  {
    key: "food-menu",
    icon: <CoffeeOutlined />,
    label: "Foods & Menus",
    allowedRoles: ["ADMIN", "MANAGER", "KITCHEN_STAFF"],
    children: [
      {
        key: "/food-categories",
        icon: <FolderOpenOutlined />,
        label: <Link to="/food-categories">Food Category Management</Link>,
        allowedRoles: ["ADMIN", "MANAGER", "KITCHEN_STAFF"],
      },
      {
        key: "/foods",
        icon: <CoffeeOutlined />,
        label: <Link to="/foods">Food Management</Link>,
        allowedRoles: ["ADMIN", "MANAGER", "KITCHEN_STAFF"],
      },
      {
        key: "/menu-schedules",
        icon: <CalendarOutlined />,
        label: <Link to="/menu-schedules">Menu Schedule Management</Link>,
        allowedRoles: ["ADMIN", "MANAGER", "KITCHEN_STAFF"],
      },
    ],
  },

  // ================= OPERATIONS =================
  {
    key: "operations",
    icon: <ShoppingOutlined />,
    label: "Operations",
    allowedRoles: ["ADMIN", "MANAGER", "KITCHEN_STAFF", "COUNTER_STAFF"],
    children: [
      {
        key: "/orders",
        icon: <ShoppingCartOutlined />,
        label: <Link to="/orders">Order Management</Link>,
        allowedRoles: ["ADMIN", "MANAGER", "COUNTER_STAFF"],
      },
      {
        key: "/kitchen-queue",
        icon: <OrderedListOutlined />,
        label: <Link to="/kitchen-queue">Kitchen Queue</Link>,
        allowedRoles: ["ADMIN", "MANAGER", "KITCHEN_STAFF"],
      },
      {
        key: "/ratings",
        icon: <StarOutlined />,
        label: <Link to="/ratings">Ratings & Feedbacks</Link>,
        allowedRoles: ["ADMIN", "MANAGER", "COUNTER_STAFF"],
      },
    ],
  },

  // ================= INVENTORY =================
  {
    key: "inventory",
    icon: <DatabaseOutlined />,
    label: "Inventory",
    allowedRoles: ["ADMIN", "MANAGER", "KITCHEN_STAFF"],
    children: [
      {
        key: "/ingredient-categories",
        icon: <TagsOutlined />,
        label: (
          <Link to="/ingredient-categories">
            Ingredient Category Management
          </Link>
        ),
        allowedRoles: ["ADMIN", "MANAGER", "KITCHEN_STAFF"],
      },
      {
        key: "/ingredients",
        icon: <InboxOutlined />,
        label: <Link to="/ingredients">Ingredient Management</Link>,
        allowedRoles: ["ADMIN", "MANAGER", "KITCHEN_STAFF"],
      },
      {
        key: "/suppliers",
        icon: <ShopOutlined />,
        label: <Link to="/suppliers">Supplier Management</Link>,
        allowedRoles: ["ADMIN", "MANAGER"],
      },
      {
        key: "/inventory-transactions",
        icon: <HistoryOutlined />,
        label: (
          <Link to="/inventory-transactions">
            Inventory Transactions
          </Link>
        ),
        allowedRoles: ["ADMIN", "MANAGER"],
      },
    ],
  },

  // ================= ACCOUNTS / HR =================
  {
    key: "accounts",
    icon: <ApartmentOutlined />,
    label: "Accounts & HR",
    allowedRoles: ["ADMIN", "MANAGER"],
    children: [
      {
        key: "/users",
        icon: <TeamOutlined />,
        label: <Link to="/users">User Management</Link>,
        allowedRoles: ["ADMIN", "MANAGER"],
      },
      {
        key: "/staffs",
        icon: <UserSwitchOutlined />,
        label: <Link to="/staffs">Staff Management</Link>,
        allowedRoles: ["ADMIN", "MANAGER"],
      },
    ],
  },

  // ================= REPORTS =================
  {
    key: "reports",
    icon: <BarChartOutlined />,
    label: "Reports & Analytics",
    allowedRoles: ["ADMIN", "MANAGER"],
    children: [
      {
        key: "/reports/revenue",
        icon: <BarChartOutlined />,
        label: (
          <Link to="/reports/revenue">
            Revenue Report
          </Link>
        ),
        allowedRoles: ["ADMIN", "MANAGER"],
      },
      {
        key: "/reports/peak-hour",
        icon: <ClockCircleOutlined />,
        label: (
          <Link to="/reports/peak-hour">
            Peak Hour Report
          </Link>
        ),
        allowedRoles: ["ADMIN", "MANAGER"],
      },
      {
        key: "/reports/order-statistics",
        icon: <PieChartOutlined />,
        label: (
          <Link to="/reports/order-statistics">
            Order Statistics
          </Link>
        ),
        allowedRoles: ["ADMIN", "MANAGER"],
      },
      {
        key: "/reports/popular-food",
        icon: <FireOutlined />,
        label: (
          <Link to="/reports/popular-food">
            Popular Food Report
          </Link>
        ),
        allowedRoles: ["ADMIN", "MANAGER"],
      },
    ],
  },

  // ================= SYSTEM =================
  {
    key: "/activity-logs",
    icon: <AuditOutlined />,
    label: <Link to="/activity-logs">Activity Logs</Link>,
    allowedRoles: ["ADMIN", "MANAGER"],
  },
];

export default menuItems;
