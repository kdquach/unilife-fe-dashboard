import React from "react";
import {
  CheckCircleOutlined,
  StopOutlined,
  TeamOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import { Card, Col, Row, Table, Tag, Typography } from "antd";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import { mockUsers } from "../features/users/mockUsers";
import { roleColors, roleLabels } from "../constants/roles";
import { formatDate } from "../utils/format";

export default function DashboardPage() {
  const active = mockUsers.filter((user) => user.isActive).length;
  const inactive = mockUsers.length - active;
  const staff = mockUsers.filter((user) => user.role !== "CUSTOMER").length;

  return (
    <div>
      <PageHeader
        title="Overview"
        description="Sprint 1 dashboard overview for UniLife administration. User management is the main active module."
        breadcrumbs={["Dashboard", "Overview"]}
      />

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={12} xl={6}>
          <StatCard
            title="Total Users"
            value={mockUsers.length}
            prefix={<TeamOutlined />}
            valueStyle={{ color: "#ff4a2b" }}
          />
        </Col>
        <Col xs={24} md={12} xl={6}>
          <StatCard
            title="Active Accounts"
            value={active}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: "#16a34a" }}
          />
        </Col>
        <Col xs={24} md={12} xl={6}>
          <StatCard
            title="Inactive Accounts"
            value={inactive}
            prefix={<StopOutlined />}
            valueStyle={{ color: "#ef4444" }}
          />
        </Col>
        <Col xs={24} md={12} xl={6}>
          <StatCard
            title="Staff/Admin"
            value={staff}
            prefix={<UserSwitchOutlined />}
            valueStyle={{ color: "#2563eb" }}
          />
        </Col>
      </Row>

      <Card className="dashboard-card" title="Recently Created Users">
        <Table
          rowKey="id"
          dataSource={mockUsers.slice(0, 5)}
          pagination={false}
          columns={[
            { title: "Full name", dataIndex: "fullName" },
            { title: "Email", dataIndex: "email" },
            {
              title: "Role",
              dataIndex: "role",
              render: (role) => (
                <Tag color={roleColors[role]}>{roleLabels[role]}</Tag>
              ),
            },
            {
              title: "Status",
              dataIndex: "isActive",
              render: (value) => (
                <Tag color={value ? "green" : "red"}>
                  {value ? "Active" : "Inactive"}
                </Tag>
              ),
            },
            { title: "Created at", dataIndex: "createdAt", render: formatDate },
          ]}
        />
      </Card>

      <Typography.Paragraph className="!mt-5 !text-slate-500">
        Next modules can reuse this dashboard shell: food management, menu
        schedule, orders, queues, notifications and ratings.
      </Typography.Paragraph>
    </div>
  );
}
