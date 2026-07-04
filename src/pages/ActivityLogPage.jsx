import React, { useCallback, useEffect, useState } from "react";
import {
  AuditOutlined,
  EyeOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Space,
  Table,
  Tag,
  message,
} from "antd";
import PageHeader from "../components/PageHeader";
import { activityLogService } from "../features/activityLogs/activityLogService";
import ActivityLogDetailDrawer from "../features/activityLogs/ActivityLogDetailDrawer";
import { formatDateTime } from "../utils/format";

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
  const [filters, setFilters] = useState({});

  const fetchLogs = useCallback(
    async (
      page = pagination.current,
      pageSize = pagination.pageSize,
      currentFilters = filters,
    ) => {
      setLoading(true);
      try {
        const response = await activityLogService.getActivityLogs({
          page,
          limit: pageSize,
          ...currentFilters,
        });
        setLogs(response.items);
        setPagination({
          current: response.pagination.page,
          pageSize: response.pagination.limit,
          total: response.pagination.total,
        });
      } catch (error) {
        message.error(error.message || "Failed to load activity logs");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchLogs(1, 10, {});
  }, []);

  const openDrawer = (log) => {
    setSelectedLogId(log.activityLogId || log._id);
    setDrawerOpen(true);
  };

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
      width: 180,
      render: (action) => (
        <Tag color={getActionColor(action)} className="font-mono text-xs">
          {action}
        </Tag>
      ),
    },
    {
      title: "Target Type",
      dataIndex: "targetType",
      width: 140,
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

      {/* Table */}
      <Card className="dashboard-card" title="Activity Logs">
        <Table
          rowKey={(record) => record.activityLogId || record._id}
          loading={loading}
          dataSource={logs}
          columns={columns}
          scroll={{ x: 1000 }}
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
