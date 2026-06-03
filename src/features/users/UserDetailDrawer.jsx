import React from "react";
import { Avatar, Descriptions, Drawer, Tag, Timeline, Typography } from "antd";
import { roleColors, roleLabels } from "../../constants/roles";
import { formatDateTime } from "../../utils/format";

export default function UserDetailDrawer({ open, user, onClose }) {
  return (
    <Drawer title="User Detail" width={520} open={open} onClose={onClose}>
      {!user ? null : (
        <div>
          <div className="mb-6 flex items-center gap-4 rounded-3xl bg-unilife-soft p-5">
            <Avatar size={72} className="bg-unilife text-xl font-bold">
              {user.fullName?.[0]}
            </Avatar>
            <div>
              <Typography.Title level={4} className="!mb-1">
                {user.fullName}
              </Typography.Title>
              <Typography.Text className="text-slate-500">
                {user.email}
              </Typography.Text>
              <div className="mt-2 flex gap-2">
                <Tag color={roleColors[user.role]}>{roleLabels[user.role]}</Tag>
                <Tag color={user.isActive ? "green" : "red"}>
                  {user.isActive ? "Active" : "Inactive"}
                </Tag>
              </div>
            </div>
          </div>

          <Descriptions bordered column={1} size="middle">
            <Descriptions.Item label="User ID">{user.id}</Descriptions.Item>
            <Descriptions.Item label="Full name">
              {user.fullName}
            </Descriptions.Item>
            <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
            <Descriptions.Item label="Phone">{user.phone}</Descriptions.Item>
            <Descriptions.Item label="Role">
              {roleLabels[user.role]}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {user.isActive ? "Active" : "Inactive"}
            </Descriptions.Item>
            <Descriptions.Item label="Created at">
              {formatDateTime(user.createdAt)}
            </Descriptions.Item>
            <Descriptions.Item label="Updated at">
              {formatDateTime(user.updatedAt)}
            </Descriptions.Item>
          </Descriptions>

          <Typography.Title level={5} className="!mt-8">
            Admin Activity Preview
          </Typography.Title>
          <Timeline
            items={[
              { color: "green", children: "Account created" },
              {
                color: "orange",
                children: "Role/status can be updated by Admin",
              },
              {
                color: "blue",
                children:
                  "Detailed activity logs will be integrated with ActivityLog module later",
              },
            ]}
          />
        </div>
      )}
    </Drawer>
  );
}
