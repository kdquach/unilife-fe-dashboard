import React from "react";
import { Descriptions, Drawer, Skeleton, Tag, Typography } from "antd";
import { formatDateTime } from "../../utils/format";

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

export default function ActivityLogDetailDrawer({ open, log, onClose }) {
  return (
    <Drawer
      title="Activity Log Detail"
      width={560}
      open={open}
      onClose={onClose}
    >
      {!log ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : (
        <div>
          {/* Header summary */}
          <div className="mb-6 rounded-3xl bg-unilife-soft p-5">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Tag
                color={getActionColor(log.action)}
                className="font-mono text-sm font-semibold"
              >
                {log.action}
              </Tag>
              {log.targetType && (
                <Tag color="geekblue">{log.targetType}</Tag>
              )}
            </div>
            <Typography.Text className="text-slate-500">
              {log.description || "No description provided"}
            </Typography.Text>
          </div>

          <Descriptions bordered column={1} size="middle">
            <Descriptions.Item label="Log ID">
              <span className="font-mono text-xs">
                {log.activityLogId || log._id}
              </span>
            </Descriptions.Item>

            <Descriptions.Item label="User">
              {log.userId ? (
                <div>
                  <div className="font-semibold">{log.userId.fullName}</div>
                  <div className="text-xs text-slate-400">
                    {log.userId.email}
                  </div>
                </div>
              ) : (
                <span className="text-slate-400">System</span>
              )}
            </Descriptions.Item>

            <Descriptions.Item label="Action">
              <Tag
                color={getActionColor(log.action)}
                className="font-mono text-xs"
              >
                {log.action}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Target Type">
              {log.targetType ? (
                <Tag color="geekblue">{log.targetType}</Tag>
              ) : (
                <span className="text-slate-400">—</span>
              )}
            </Descriptions.Item>

            <Descriptions.Item label="Target ID">
              {log.targetId ? (
                <span className="font-mono text-xs">{log.targetId}</span>
              ) : (
                <span className="text-slate-400">—</span>
              )}
            </Descriptions.Item>

            <Descriptions.Item label="Description">
              {log.description || <span className="text-slate-400">—</span>}
            </Descriptions.Item>

            <Descriptions.Item label="IP Address">
              <span className="font-mono text-xs">
                {log.ipAddress || "—"}
              </span>
            </Descriptions.Item>

            <Descriptions.Item label="Created At">
              {formatDateTime(log.createdAt)}
            </Descriptions.Item>
          </Descriptions>
        </div>
      )}
    </Drawer>
  );
}
