import React, { useCallback, useEffect, useState } from "react";
import {
  AuditOutlined,
  EyeOutlined,
  FilterOutlined,
  ReloadOutlined,
  UserOutlined,
  ThunderboltOutlined,
  AppstoreOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  DatePicker,
  Input,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
} from "antd";
import { notify } from "../utils/notify";
import dayjs from "dayjs";
import PageHeader from "../components/PageHeader";
import { activityLogService } from "../features/activityLogs/activityLogService";
import { staffService } from "../features/staffs/staffService";
import ActivityLogDetailDrawer from "../features/activityLogs/ActivityLogDetailDrawer";
import { formatDateTime } from "../utils/format";

const { Search } = Input;
const { RangePicker } = DatePicker;

// Màu sắc theo action
const ACTION_COLORS = {
  LOGIN: "green",
  LOGOUT: "default",
  CREATE: "blue",
  UPDATE: "orange",
  DELETE: "red",
  VIEW: "cyan",
};

const getActionColor = (action = "") => {
  const key = Object.keys(ACTION_COLORS).find((k) =>
    action.toUpperCase().includes(k),
  );
  return ACTION_COLORS[key] || "purple";
};

// TargetType options
const TARGET_TYPE_OPTIONS = [
  { label: "Order", value: "Order" },
  { label: "User", value: "User" },
  { label: "Food", value: "Food" },
  { label: "FoodCategory", value: "FoodCategory" },
  { label: "Ingredient", value: "Ingredient" },
  { label: "IngredientCategory", value: "IngredientCategory" },
  { label: "IngredientBatch", value: "IngredientBatch" },
  { label: "IngredientTransaction", value: "IngredientTransaction" },
  { label: "MenuSchedule", value: "MenuSchedule" },
  { label: "MenuScheduleItem", value: "MenuScheduleItem" },
  { label: "Supplier", value: "Supplier" },
  { label: "Payment", value: "Payment" },
  { label: "Queue", value: "Queue" },
  { label: "Rating", value: "Rating" },
];

const EMPTY_FILTERS = {
  keyword: undefined,
  targetType: undefined,
  userId: undefined,
  startDate: undefined,
  endDate: undefined,
};

export default function ActivityLogPage() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(false);

  // Statistics state
  const [stats, setStats] = useState({
    summary: { totalLogs: 0, selectedUser: null },
    actionBreakdown: [],
    userOrModuleStats: [],
  });
  const [statsLoading, setStatsLoading] = useState(false);

  // Canteen staff dropdown options
  const [staffOptions, setStaffOptions] = useState([]);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState(null);

  // Filter state
  const [filters, setFilters] = useState({ ...EMPTY_FILTERS });
  const [dateRange, setDateRange] = useState(null);

  // Load only canteen staff for the user filter.
  useEffect(() => {
    const loadStaffs = async () => {
      try {
        const response = await staffService.getStaffs({ limit: 100 });
        const items = response?.data || [];
        if (Array.isArray(items)) {
          setStaffOptions(
            items.map((staff) => ({
              label: `${staff.fullName || "Staff"} (${staff.role || staff.email})`,
              value: staff.userId || staff._id || staff.id,
            })),
          );
        }
      } catch (err) {
        console.error("Failed to load staff list:", err);
      }
    };
    loadStaffs();
  }, []);

  const fetchLogs = useCallback(
    async (
      page = 1,
      pageSize = 10,
      currentFilters = filters,
    ) => {
      setLoading(true);
      try {
        const params = { page, limit: pageSize };
        if (currentFilters.keyword) params.keyword = currentFilters.keyword;
        if (currentFilters.targetType) params.targetType = currentFilters.targetType;
        if (currentFilters.userId) params.userId = currentFilters.userId;
        if (currentFilters.startDate) params.startDate = currentFilters.startDate;
        if (currentFilters.endDate) params.endDate = currentFilters.endDate;

        const response = await activityLogService.getActivityLogs(params);
        setLogs(response.items);
        setPagination({
          current: response.pagination.page,
          pageSize: response.pagination.limit,
          total: response.pagination.total,
        });
      } catch (error) {
        notify.error(error.message || "Failed to load activity logs");
      } finally {
        setLoading(false);
      }
    },
    [filters],
  );

  const fetchStats = useCallback(
    async (currentFilters = filters) => {
      setStatsLoading(true);
      try {
        const params = {};
        if (currentFilters.targetType) params.targetType = currentFilters.targetType;
        if (currentFilters.userId) params.userId = currentFilters.userId;
        if (currentFilters.startDate) params.startDate = currentFilters.startDate;
        if (currentFilters.endDate) params.endDate = currentFilters.endDate;

        const data = await activityLogService.getActivityLogStats(params);
        if (data) {
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to load stats:", error);
      } finally {
        setStatsLoading(false);
      }
    },
    [filters],
  );

  const refreshAllData = (page = 1, pageSize = pagination.pageSize, currentFilters = filters) => {
    fetchLogs(page, pageSize, currentFilters);
    fetchStats(currentFilters);
  };

  useEffect(() => {
    refreshAllData(1, 10, EMPTY_FILTERS);
  }, []);

  const openDrawer = (log) => {
    setSelectedLogId(log.activityLogId || log._id);
    setDrawerOpen(true);
  };

  const handleSearch = (value) => {
    const newFilters = { ...filters, keyword: value || undefined };
    setFilters(newFilters);
    refreshAllData(1, pagination.pageSize, newFilters);
  };

  const handleTargetTypeChange = (value) => {
    const newFilters = { ...filters, targetType: value || undefined };
    setFilters(newFilters);
    refreshAllData(1, pagination.pageSize, newFilters);
  };

  const handleUserChange = (value) => {
    const newFilters = { ...filters, userId: value || undefined };
    setFilters(newFilters);
    refreshAllData(1, pagination.pageSize, newFilters);
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
    const newFilters = {
      ...filters,
      startDate: dates?.[0] ? dates[0].format("YYYY-MM-DD") : undefined,
      endDate: dates?.[1] ? dates[1].format("YYYY-MM-DD") : undefined,
    };
    setFilters(newFilters);
    refreshAllData(1, pagination.pageSize, newFilters);
  };

  const handleReset = () => {
    setDateRange(null);
    setFilters({ ...EMPTY_FILTERS });
    refreshAllData(1, pagination.pageSize, EMPTY_FILTERS);
  };

  const hasActiveFilter =
    filters.keyword || filters.targetType || filters.userId || filters.startDate || filters.endDate;

  const columns = [
    {
      title: "Time",
      dataIndex: "createdAt",
      width: 160,
      render: formatDateTime,
    },
    {
      title: "User",
      dataIndex: "userId",
      width: 200,
      render: (userId) =>
        userId ? (
          <div>
            <div className="font-semibold text-slate-900">
              {userId.fullName || "—"}
            </div>
            <div className="text-xs text-slate-400">{userId.email}</div>
          </div>
        ) : (
          <span className="text-slate-400">System</span>
        ),
    },
    {
      title: "Action",
      dataIndex: "action",
      width: 200,
      render: (action) => (
        <Tag color={getActionColor(action)} className="font-mono text-xs">
          {action}
        </Tag>
      ),
    },
    {
      title: "Target Type",
      dataIndex: "targetType",
      width: 150,
      render: (targetType) =>
        targetType ? (
          <Tag color="geekblue">{targetType}</Tag>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    {
      title: "Description",
      dataIndex: "description",
      ellipsis: true,
      render: (desc) => desc || <span className="text-slate-400">—</span>,
    },
    {
      title: "IP Address",
      dataIndex: "ipAddress",
      width: 140,
      render: (ip) => (
        <span className="font-mono text-xs text-slate-500">{ip || "—"}</span>
      ),
    },
    {
      title: "Actions",
      fixed: "right",
      width: 80,
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => openDrawer(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Activity Logs & Analytics"
        breadcrumbs={["Dashboard", "Activity Logs"]}
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={() => refreshAllData(pagination.current, pagination.pageSize, filters)}
          >
            Reload
          </Button>
        }
      />

      {/* 3 Key Statistics Panels */}
      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Stat 1: Total Activity Count */}
        <Card className="dashboard-card border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden bg-gradient-to-br from-white via-slate-50/50 to-blue-50/20">
          <div className="p-1">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <AuditOutlined className="text-blue-500" />
                {stats.summary?.selectedUser ? "User Total Activities" : "Total System Activities"}
              </span>
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                {stats.summary?.selectedUser ? "User View" : "System-wide"}
              </span>
            </div>

            <div className="flex items-baseline gap-2 my-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {stats.summary?.totalLogs ?? pagination.total}
              </span>
              <span className="text-sm font-medium text-slate-500">actions logged</span>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
              {stats.summary?.selectedUser ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50/80 px-3 py-1.5 rounded-lg w-full truncate">
                  <UserOutlined />
                  <span className="truncate">{stats.summary.selectedUser.fullName}</span>
                  <Tag color="geekblue" className="ml-auto m-0 text-[10px] uppercase font-bold">
                    {stats.summary.selectedUser.role || "User"}
                  </Tag>
                </div>
              ) : (
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live activity recording active
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Stat 2: Action Category Breakdown */}
        <Card
          className="dashboard-card border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl bg-gradient-to-br from-white via-slate-50/50 to-indigo-50/20"
          title={
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ThunderboltOutlined className="text-amber-500" /> Action Category Breakdown
              </span>
            </div>
          }
        >
          <div className="space-y-2.5">
            {stats.actionBreakdown?.map((item) => {
              const total = stats.summary?.totalLogs || 1;
              const percent = Math.round((item.count / total) * 100) || 0;
              let barGradient = "from-blue-500 to-indigo-600";
              let badgeBg = "bg-blue-50 text-blue-700";

              if (item.category === "UPDATE") {
                barGradient = "from-amber-400 to-orange-500";
                badgeBg = "bg-amber-50 text-amber-700";
              }
              if (item.category === "DELETE") {
                barGradient = "from-rose-500 to-red-600";
                badgeBg = "bg-rose-50 text-rose-700";
              }
              if (item.category === "OPERATIONS") {
                barGradient = "from-emerald-400 to-teal-600";
                badgeBg = "bg-emerald-50 text-emerald-700";
              }

              return (
                <div key={item.category} className="text-xs">
                  <div className="flex justify-between items-center mb-1 font-medium">
                    <span className="text-slate-700 font-semibold">{item.label}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold ${badgeBg}`}>
                      {item.count} ({percent}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${barGradient} transition-all duration-500`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Stat 3: Top Active Staff OR User Module Breakdown */}
        <Card
          className="dashboard-card border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl bg-gradient-to-br from-white via-slate-50/50 to-purple-50/20"
          title={
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                {stats.summary?.selectedUser ? (
                  <>
                    <AppstoreOutlined className="text-indigo-500" />
                    Module Breakdown
                  </>
                ) : (
                  <>
                    <CrownOutlined className="text-amber-500" />
                    Top Active Staff
                  </>
                )}
              </span>
              <span className="text-[11px] font-normal text-slate-400">
                {stats.summary?.selectedUser ? "By Entity" : "Rankings"}
              </span>
            </div>
          }
        >
          <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
            {stats.userOrModuleStats?.length > 0 ? (
              stats.userOrModuleStats.map((item, idx) => {
                if (!stats.summary?.selectedUser) {
                  // Overall Top Users
                  return (
                    <div
                      key={item.userId || idx}
                      className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100/80 last:border-0 hover:bg-slate-50/60 px-1 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                          idx === 0
                            ? "bg-amber-100 text-amber-700 border border-amber-300"
                            : idx === 1
                            ? "bg-slate-200 text-slate-700"
                            : idx === 2
                            ? "bg-amber-700/10 text-amber-900"
                            : "bg-slate-100 text-slate-500"
                        }`}>
                          {idx + 1}
                        </span>
                        <div className="truncate">
                          <span className="font-semibold text-slate-800">
                            {item.fullName}
                          </span>
                          {item.role && (
                            <Tag className="ml-1.5 text-[10px] py-0 px-1 font-semibold" color="geekblue">
                              {item.role}
                            </Tag>
                          )}
                        </div>
                      </div>
                      <Tag color="blue" className="font-mono text-xs font-bold m-0 border-0 bg-blue-100/70 text-blue-800">
                        {item.count} logs
                      </Tag>
                    </div>
                  );
                } else {
                  // Selected User Module breakdown
                  const total = stats.summary?.totalLogs || 1;
                  const percent = Math.round((item.count / total) * 100) || 0;
                  return (
                    <div key={item.targetType || idx} className="text-xs">
                      <div className="flex justify-between items-center mb-1 font-medium">
                        <Tag color="geekblue" className="m-0 text-[11px] font-bold">
                          {item.targetType}
                        </Tag>
                        <span className="text-slate-500 font-mono">
                          {item.count} actions ({percent}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-1">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                }
              })
            ) : (
              <div className="text-xs text-slate-400 text-center py-6">
                No statistics data available for selected filter
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Table with filters */}
      <Card
        className="dashboard-card border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden"
        title={
          <span className="font-bold text-slate-800 text-base">Activity Logs Directory</span>
        }
        extra={
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <Search
              placeholder="Search action or description..."
              allowClear
              style={{ width: 230 }}
              onSearch={handleSearch}
              onChange={(e) => {
                if (!e.target.value) handleSearch("");
              }}
            />

            <Select
              placeholder="Filter by Staff"
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
              style={{ width: 210 }}
              options={staffOptions}
              onChange={handleUserChange}
              value={filters.userId}
            />

            <Select
              placeholder="Target Type"
              allowClear
              style={{ width: 170 }}
              options={TARGET_TYPE_OPTIONS}
              onChange={handleTargetTypeChange}
              value={filters.targetType}
            />

            <RangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              format="DD/MM/YYYY"
              placeholder={["Start date", "End date"]}
              style={{ width: 240 }}
              disabledDate={(current) => current && current > dayjs().endOf("day")}
            />

            {hasActiveFilter && (
              <Button icon={<FilterOutlined />} onClick={handleReset} danger>
                Reset Filters
              </Button>
            )}
          </div>
        }
      >
        <Table
          rowKey={(record) => record.activityLogId || record._id}
          loading={loading}
          dataSource={logs}
          columns={columns}
          scroll={{ x: 1050 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `${total} activity logs`,
            onChange: (page, pageSize) => refreshAllData(page, pageSize, filters),
          }}
        />
      </Card>

      <ActivityLogDetailDrawer
        open={drawerOpen}
        logId={selectedLogId}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
