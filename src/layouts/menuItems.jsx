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
  ShoppingOutlined 
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
    icon: <ApartmentOutlined />,
    label: "Users",
    children: [
      {
        key: "/users",
        icon: <TeamOutlined />,
        label: <Link to="/users">User Management</Link>,
      },
      {
        key: "/staffs",
        icon: <UserSwitchOutlined />,
        label: <Link to="/staffs">Staff Management</Link>,
      },
    ],
  },

  // ================= ORDERS =================
  {
    key: "orders",
    icon: <ShoppingOutlined  />,
    label: "Orders",
    children: [
      {
        key: "/orders",
        icon: <ShoppingCartOutlined />,
        label: <Link to="/orders">Order Management</Link>,
      },
      {
        key: "/foods",
        icon: <CoffeeOutlined />,
        label: <Link to="/foods">Foods</Link>,
      },
      {
        key: "/kitchen-queue",
        icon: <OrderedListOutlined />,
        label: <Link to="/kitchen-queue">Kitchen Queue</Link>,
      },
      {
        key: "/menu-schedules",
        icon: <CalendarOutlined />,
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
        icon: <FolderOpenOutlined />,
        label: <Link to="/food-categories">Food Categories</Link>,
      },
      {
        key: "/ingredient-categories",
        icon: <TagsOutlined />,
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
    icon: <BarChartOutlined />,
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
      {
        key: "/reports/order-statistics",
        icon: <PieChartOutlined />,
        label: (
          <Link to="/reports/order-statistics">
            Order Statistics
          </Link>
        ),
      },
      {
        key: "/reports/popular-food",
        icon: <FireOutlined />,
        label: (
          <Link to="/reports/popular-food">
            Popular Food Report
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