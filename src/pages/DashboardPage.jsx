import React, { useEffect, useMemo, useState } from "react";
import {
  AppstoreOutlined,
  ArrowRightOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  HistoryOutlined,
  InboxOutlined,
  OrderedListOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  TagsOutlined,
  TeamOutlined,
  UserSwitchOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Progress,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import { dashboardService } from "../features/dashboard/dashboardService";
import { roleColors, roleLabels } from "../constants/roles";
import { formatDate } from "../utils/format";

const moduleShortcuts = [
  {
    title: "Users",
    description: "Manage staff and customer accounts.",
    path: "/users",
    icon: <TeamOutlined />,
    accent: "from-orange-500 to-orange-600",
  },
  {
    title: "Orders",
    description: "Review order flow and updates.",
    path: "/orders",
    icon: <ShoppingCartOutlined />,
    accent: "from-slate-700 to-slate-900",
  },
  {
    title: "Food Categories",
    description: "Organize food grouping and labels.",
    path: "/food-categories",
    icon: <TagsOutlined />,
    accent: "from-amber-500 to-orange-500",
  },
  {
    title: "Ingredients",
    description: "Track ingredient records and stock.",
    path: "/ingredients",
    icon: <InboxOutlined />,
    accent: "from-emerald-500 to-teal-600",
  },
  {
    title: "Inventory",
    description: "Inspect import and adjustment history.",
    path: "/inventory-transactions",
    icon: <HistoryOutlined />,
    accent: "from-blue-500 to-cyan-600",
  },
  {
    title: "Kitchen Queue",
    description: "Keep the back-of-house flow visible.",
    path: "/kitchen-queue",
    icon: <OrderedListOutlined />,
    accent: "from-violet-500 to-indigo-600",
  },
  {
    title: "Menu Schedules",
    description: "Plan menus by day and time.",
    path: "/menu-schedules",
    icon: <CalendarOutlined />,
    accent: "from-fuchsia-500 to-pink-600",
  },
  {
    title: "Suppliers",
    description: "Maintain vendor and contact records.",
    path: "/suppliers",
    icon: <ShopOutlined />,
    accent: "from-lime-500 to-emerald-600",
  },
];

const emptyOverview = {
  users: {
    total: 0,
    active: 0,
    inactive: 0,
    staff: 0,
    customers: 0,
    activeRate: 0,
    recentUsers: [],
  },
  orders: {
    total: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
  },
  queue: {
    currentServing: null,
    waiting: [],
    summary: {},
    pagination: { total: 0 },
  },
  modules: {
    ingredients: 0,
    ingredientCategories: 0,
    foodCategories: 0,
    suppliers: 0,
  },
};

const getUserRowKey = (record) =>
  record?._id || record?.id || record?.userId || record?.email;

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState(emptyOverview);

  const loadOverview = async () => {
    setLoading(true);

    try {
      const [users, orders, queue, modules] = await Promise.all([
        dashboardService.getUsersOverview(),
        dashboardService.getOrdersOverview(),
        dashboardService.getQueueOverview(),
        dashboardService.getModuleOverview(),
      ]);

      setOverview({
        users,
        orders,
        queue,
        modules,
      });
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  const recentUsers = overview.users.recentUsers || [];
  const queueSummary = overview.queue.summary || {};

  const totalModules = useMemo(
    () =>
      Object.values(overview.modules).reduce((sum, value) => sum + Number(value || 0), 0),
    [overview.modules],
  );

  const recentColumns = [
    {
      title: "Full name",
      dataIndex: "fullName",
      render: (fullName, record) => (
        <div className="flex items-center gap-3">
          <Avatar className="bg-unilife">
            {fullName?.[0] || record.email?.[0] || "U"}
          </Avatar>
          <div>
            <div className="font-semibold text-slate-900">{fullName}</div>
            <div className="text-xs text-slate-500">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      width: 150,
      render: (role) => <Tag color={roleColors[role]}>{roleLabels[role]}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "isActive",
      width: 120,
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      width: 150,
      render: formatDate,
    },
  ];

  const openRoute = (path) => navigate(path);

  return (
    <Spin spinning={loading}>
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-orange-100 bg-white shadow-[0_20px_60px_rgba(17,24,39,0.08)]">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,74,43,0.14),rgba(255,255,255,0)_42%,rgba(15,23,42,0.03))]" />
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orange-100/70 blur-3xl" />
          <div className="absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-slate-100/80 blur-3xl" />

          <div className="relative grid gap-6 p-6 lg:grid-cols-[1.6fr_0.9fr] lg:p-8">
            <div className="flex flex-col justify-between gap-6">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-unilife shadow-sm">
                  <AppstoreOutlined />
                  Live dashboard
                </div>
                <Typography.Title
                  level={1}
                  className="!mb-3 !max-w-3xl !text-3xl !font-black !leading-tight !text-slate-950 md:!text-5xl"
                >
                  Welcome back, {user?.fullName || "Admin"}.
                  <span className="block text-unilife">
                    Everything here is now powered by the live API.
                  </span>
                </Typography.Title>
                <Typography.Paragraph className="!mb-0 !max-w-2xl !text-base !text-slate-600 md:!text-lg">
                  This home screen gives you real user, order, queue, and module
                  counts so you can jump straight into the operational areas.
                </Typography.Paragraph>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button
                  type="primary"
                  size="large"
                  icon={<TeamOutlined />}
                  onClick={() => openRoute("/users")}
                >
                  Open Users
                </Button>
                <Button
                  size="large"
                  icon={<ShoppingCartOutlined />}
                  onClick={() => openRoute("/orders")}
                >
                  Review Orders
                </Button>
                <Button
                  size="large"
                  icon={<CalendarOutlined />}
                  onClick={() => openRoute("/menu-schedules")}
                >
                  View Schedules
                </Button>
              </div>
            </div>

            <Card
              className="dashboard-card h-full border-orange-100 bg-white/95"
              styles={{ body: { height: "100%", padding: 24 } }}
            >
              <div className="flex h-full flex-col justify-between gap-6">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Platform pulse
                  </div>
                  <div className="mt-3 flex items-end justify-between gap-3">
                    <div>
                      <div className="text-sm text-slate-500">Active rate</div>
                      <div className="text-4xl font-black text-slate-950">
                        {overview.users.activeRate}%
                      </div>
                    </div>
                    <Tag color="green" className="m-0 px-3 py-1 text-xs">
                      Live API
                    </Tag>
                  </div>

                  <Progress
                    className="mt-4"
                    percent={overview.users.activeRate}
                    showInfo={false}
                    strokeColor="#ff4a2b"
                    trailColor="#f1f5f9"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">Total users</div>
                    <div className="mt-1 text-2xl font-bold text-slate-950">
                      {overview.users.total}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-orange-50 p-4">
                    <div className="text-sm text-slate-500">Pending orders</div>
                    <div className="mt-1 text-2xl font-bold text-unilife">
                      {overview.orders.pending}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 p-4">
                    <div className="text-sm text-slate-500">Queue waiting</div>
                    <div className="mt-1 text-2xl font-bold text-emerald-600">
                      {queueSummary.waiting ?? overview.queue.waiting?.length ?? 0}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-rose-50 p-4">
                    <div className="text-sm text-slate-500">Inactive users</div>
                    <div className="mt-1 text-2xl font-bold text-rose-500">
                      {overview.users.inactive}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="dashboard-card" styles={{ body: { padding: 20 } }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm text-slate-500">Active Accounts</div>
                <div className="mt-1 text-3xl font-black text-emerald-600">
                  {overview.users.active}
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-xl text-emerald-600">
                <CheckCircleOutlined />
              </div>
            </div>
            <div className="mt-4 text-sm text-slate-500">
              Accounts currently available for operations.
            </div>
          </Card>

          <Card className="dashboard-card" styles={{ body: { padding: 20 } }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm text-slate-500">Inactive Accounts</div>
                <div className="mt-1 text-3xl font-black text-rose-500">
                  {overview.users.inactive}
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-xl text-rose-500">
                <WarningOutlined />
              </div>
            </div>
            <div className="mt-4 text-sm text-slate-500">
              Live count from the users API.
            </div>
          </Card>

          <Card className="dashboard-card" styles={{ body: { padding: 20 } }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm text-slate-500">Staff Members</div>
                <div className="mt-1 text-3xl font-black text-unilife">
                  {overview.users.staff}
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-xl text-unilife">
                <UserSwitchOutlined />
              </div>
            </div>
            <div className="mt-4 text-sm text-slate-500">
              Admin, manager, counter, and kitchen staff combined.
            </div>
          </Card>

          <Card className="dashboard-card" styles={{ body: { padding: 20 } }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm text-slate-500">Orders Today</div>
                <div className="mt-1 text-3xl font-black text-slate-900">
                  {overview.orders.total}
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl text-slate-700">
                <ShoppingCartOutlined />
              </div>
            </div>
            <div className="mt-4 text-sm text-slate-500">
              Total order records available from the live API.
            </div>
          </Card>
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Quick access
              </div>
              <Typography.Title level={3} className="!mb-0 !mt-1 !text-slate-950">
                Jump into the main modules
              </Typography.Title>
            </div>
            <Button icon={<ArrowRightOutlined />} onClick={() => openRoute("/users")}>
              Go to Users
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {moduleShortcuts.map((item) => (
              <Link key={item.path} to={item.path} className="group block">
                <Card
                  hoverable
                  className="dashboard-card h-full overflow-hidden border-slate-100 transition duration-200 group-hover:-translate-y-1 group-hover:shadow-[0_18px_40px_rgba(17,24,39,0.10)]"
                  styles={{ body: { padding: 20, height: "100%" } }}
                >
                  <div className="flex h-full flex-col justify-between gap-6">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${item.accent} text-xl text-white`}>
                      {item.icon}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <Typography.Title level={4} className="!mb-0 !text-slate-950">
                          {item.title}
                        </Typography.Title>
                        <ArrowRightOutlined className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-unilife" />
                      </div>
                      <Typography.Paragraph className="!mb-0 !text-sm !text-slate-500">
                        {item.description}
                      </Typography.Paragraph>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.5fr_0.9fr]">
          <Card
            className="dashboard-card"
            title={
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Recent users
                </div>
                <div className="text-lg font-semibold text-slate-950">
                  Latest created accounts from API
                </div>
              </div>
            }
            extra={
              <Button type="link" onClick={() => openRoute("/users")}>
                View all users
              </Button>
            }
            styles={{ body: { padding: 0 } }}
          >
            <Table
              rowKey={getUserRowKey}
              dataSource={recentUsers}
              columns={recentColumns}
              pagination={false}
              scroll={{ x: 720 }}
            />
          </Card>

          <div className="space-y-4">
            <Card
              className="dashboard-card"
              title={
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    System snapshot
                  </div>
                  <div className="text-lg font-semibold text-slate-950">
                    Live module counts
                  </div>
                </div>
              }
              styles={{ body: { padding: 20 } }}
            >
              <Space direction="vertical" size={16} className="w-full">
                <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                  <div className="text-sm font-semibold text-slate-900">
                    Total modules tracked
                  </div>
                  <div className="mt-1 text-3xl font-black text-slate-950">
                    {totalModules}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-orange-50 p-4">
                    <div className="text-sm text-slate-500">Suppliers</div>
                    <div className="mt-1 text-2xl font-bold text-unilife">
                      {overview.modules.suppliers}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">Food categories</div>
                    <div className="mt-1 text-2xl font-bold text-slate-950">
                      {overview.modules.foodCategories}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 p-4">
                    <div className="text-sm text-slate-500">Ingredient cats</div>
                    <div className="mt-1 text-2xl font-bold text-emerald-600">
                      {overview.modules.ingredientCategories}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-blue-50 p-4">
                    <div className="text-sm text-slate-500">Ingredients</div>
                    <div className="mt-1 text-2xl font-bold text-blue-600">
                      {overview.modules.ingredients}
                    </div>
                  </div>
                </div>
              </Space>
            </Card>

            <Card
              className="dashboard-card"
              styles={{ body: { padding: 20 } }}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Queue
                  </div>
                  <div className="mt-1 text-lg font-semibold text-slate-950">
                    Kitchen monitor summary
                  </div>
                </div>
                <Tag color="green" className="m-0">
                  Live
                </Tag>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">Serving</div>
                  <div className="mt-1 text-2xl font-bold text-slate-950">
                    {queueSummary.serving ?? 0}
                  </div>
                </div>
                <div className="rounded-2xl bg-orange-50 p-4">
                  <div className="text-sm text-slate-500">Waiting</div>
                  <div className="mt-1 text-2xl font-bold text-unilife">
                    {queueSummary.waiting ?? overview.queue.waiting?.length ?? 0}
                  </div>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-4">
                  <div className="text-sm text-slate-500">Done</div>
                  <div className="mt-1 text-2xl font-bold text-emerald-600">
                    {queueSummary.done ?? 0}
                  </div>
                </div>
                <div className="rounded-2xl bg-rose-50 p-4">
                  <div className="text-sm text-slate-500">Total</div>
                  <div className="mt-1 text-2xl font-bold text-rose-500">
                    {queueSummary.total ?? overview.queue.pagination?.total ?? 0}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </Spin>
  );
}
