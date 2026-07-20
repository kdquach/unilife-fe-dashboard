import React, { useCallback, useEffect, useState } from "react";
import {
  AuditOutlined,
  EyeOutlined,
  FilterOutlined,
  ReloadOutlined,
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
} from "antd";
import { notify } from "../utils/notify";
import dayjs from "dayjs";
import PageHeader from "../components/PageHeader";
import { activityLogService } from "../features/activityLogs/activityLogService";
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

// Danh sách targetType phổ biến trong hệ thống
const TARGET_TYPE_OPTIONS = [
  { label: "Order", value: "Order" },
  { label: "User", value: "User" },
  { label: "Food", value: "Food" },
  { label: "FoodCategory", value: "FoodCategory" },
  { label: "Ingredient", value: "Ingredient" },
  { label: "IngredientCategory", value: "IngredientCategory" },
  { label: "IngredientBatch", value: "IngredientBatch" },
  { label: "MenuSchedule", value: "MenuSchedule" },
  { label: "Supplier", value: "Supplier" },
  { label: "Payment", value: "Payment" },
  { label: "Queue", value: "Queue" },
  { label: "DATABASE", value: "DATABASE" },
];

const EMPTY_FILTERS = {
  keyword: undefined,
  targetType: undefined,
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

  // Drawer state (UC2)
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState(null);

  // Filter state (UC3)
  const [filters, setFilters] = useState({ ...EMPTY_FILTERS });
  const [dateRange, setDateRange] = useState(null);

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
    [],
  );

  useEffect(() => {
    fetchLogs(1, 10, EMPTY_FILTERS);
  }, []);

  const openDrawer = (log) => {
    setSelectedLogId(log.activityLogId || log._id);
    setDrawerOpen(true);
  };

  const handleSearch = (value) => {
    const newFilters = { ...filters, keyword: value || undefined };
    setFilters(newFilters);
    fetchLogs(1, pagination.pageSize, newFilters);
  };

  const handleTargetTypeChange = (value) => {
    const newFilters = { ...filters, targetType: value || undefined };
    setFilters(newFilters);
    fetchLogs(1, pagination.pageSize, newFilters);
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
    const newFilters = {
      ...filters,
      startDate: dates?.[0] ? dates[0].format("YYYY-MM-DD") : undefined,
      endDate: dates?.[1] ? dates[1].format("YYYY-MM-DD") : undefined,
    };
    setFilters(newFilters);
    fetchLogs(1, pagination.pageSize, newFilters);
  };

  const handleReset = () => {
    setDateRange(null);
    setFilters({ ...EMPTY_FILTERS });
    fetchLogs(1, pagination.pageSize, EMPTY_FILTERS);
  };

  const hasActiveFilter =
    filters.keyword || filters.targetType || filters.startDate || filters.endDate;

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
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => openDrawer(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Activity Logs"
        description="View and monitor all system activities performed by users."
        breadcrumbs={["Dashboard", "Activity Logs"]}
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchLogs(pagination.current, pagination.pageSize, filters)}
          >
            Reload
          </Button>
        }
      />

      {/* Stats */}
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="dashboard-card">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-unilife-soft text-xl text-unilife">
              <AuditOutlined />
            </div>
            <div>
              <div className="text-sm text-slate-500">Total Logs (current query)</div>
              <div className="text-2xl font-bold text-slate-950">
                {pagination.total}
              </div>
            </div>
          </div>
        </Card>
        <Card className="dashboard-card">
          <div className="text-sm text-slate-500">On this page</div>
          <div className="mt-1 text-2xl font-bold text-blue-600">
            {logs.length}
          </div>
        </Card>
        <Card className="dashboard-card">
          <div className="text-sm text-slate-500">Total Pages</div>
          <div className="mt-1 text-2xl font-bold text-slate-700">
            {Math.ceil(pagination.total / pagination.pageSize) || 0}
          </div>
        </Card>
      </div>

      {/* Table with filters */}
      <Card
        className="dashboard-card"
        title="Activity Logs"
        extra={
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <Search
              placeholder="Search action or description..."
              allowClear
              style={{ width: 240 }}
              onSearch={handleSearch}
              onChange={(e) => {
                if (!e.target.value) handleSearch("");
              }}
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
              <Button
                icon={<FilterOutlined />}
                onClick={handleReset}
                danger
              >
                Reset
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
            showTotal: (total) => `${total} logs`,
            onChange: (page, pageSize) => fetchLogs(page, pageSize, filters),
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
