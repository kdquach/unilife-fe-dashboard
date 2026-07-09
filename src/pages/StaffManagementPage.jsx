import React, { useEffect, useMemo, useState } from "react";
import {
  ReloadOutlined,
  SearchOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Button, Card, Input, Select, Space, Table, Tag, message } from "antd";
import PageHeader from "../components/PageHeader";
import { roleColors, roleLabels } from "../constants/roles";
import { staffService } from "../features/staffs/staffService";
import { formatDateTime } from "../utils/format";

const { Search } = Input;

const STAFF_ROLE_OPTIONS = [
  { label: "Admin", value: "ADMIN" },
  { label: "Manager", value: "MANAGER" },
  { label: "Counter Staff", value: "COUNTER_STAFF" },
  { label: "Kitchen Staff", value: "KITCHEN_STAFF" },
];

const STATUS_OPTIONS = [
  { label: "Active", value: "true" },
  { label: "Inactive", value: "false" },
];

const getStaffId = (staff) => staff?._id || staff?.id || staff?.userId;

export default function StaffManagementPage() {
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [filters, setFilters] = useState({
    role: undefined,
    isActive: undefined,
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchStaffs = async (
    page = pagination.current,
    pageSize = pagination.pageSize,
    searchKeyword = keyword,
    currentFilters = filters,
  ) => {
    setLoading(true);

    try {
      const response = await staffService.getStaffs({
        page,
        limit: pageSize,
        keyword: searchKeyword || undefined,
        ...currentFilters,
      });

      setStaffs(response.data);
      setPagination({
        current: response.pagination.page,
        pageSize: response.pagination.limit,
        total: response.pagination.total,
      });
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffs(1, pagination.pageSize);
  }, []);

  const stats = useMemo(() => {
    const active = staffs.filter((staff) => staff.isActive).length;
    return {
      total: staffs.length,
      active,
      inactive: staffs.length - active,
    };
  }, [staffs]);

  const handleFilterChange = (key, value) => {
    const nextFilters = { ...filters, [key]: value };
    setFilters(nextFilters);
    fetchStaffs(1, pagination.pageSize, keyword, nextFilters);
  };

  const columns = [
    {
      title: "Staff",
      dataIndex: "fullName",
      render: (_, record) => (
        <div>
          <div className="font-semibold text-slate-900">{record.fullName}</div>
          <div className="text-sm text-slate-500">{record.email}</div>
        </div>
      ),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      width: 150,
      render: (phone) => phone || "-",
    },
    {
      title: "Role",
      dataIndex: "role",
      width: 160,
      render: (role) => <Tag color={roleColors[role]}>{roleLabels[role]}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "isActive",
      width: 130,
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Created at",
      dataIndex: "createdAt",
      width: 180,
      render: formatDateTime,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Staff Management"
        description="View and manage staff accounts used by the UniLife operation team."
        breadcrumbs={["Dashboard", "Staff Management"]}
        extra={
          <Button
            icon={<ReloadOutlined />}
            loading={loading}
            onClick={() =>
              fetchStaffs(pagination.current, pagination.pageSize)
            }
          >
            Refresh
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="dashboard-card">
          <Space size={16}>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-unilife-soft text-xl text-unilife">
              <TeamOutlined />
            </div>
            <div>
              <div className="text-sm text-slate-500">Current page</div>
              <div className="text-2xl font-bold text-slate-950">
                {stats.total}
              </div>
            </div>
          </Space>
        </Card>
        <Card className="dashboard-card">
          <div className="text-sm text-slate-500">Active on page</div>
          <div className="mt-1 text-2xl font-bold text-green-600">
            {stats.active}
          </div>
        </Card>
        <Card className="dashboard-card">
          <div className="text-sm text-slate-500">Inactive on page</div>
          <div className="mt-1 text-2xl font-bold text-red-500">
            {stats.inactive}
          </div>
        </Card>
      </div>

      <Card
        className="dashboard-card"
        title="Staffs"
        extra={
          <Space wrap>
            <Search
              allowClear
              enterButton={<SearchOutlined />}
              placeholder="Search name, email or phone..."
              style={{ width: 280 }}
              onSearch={(value) => {
                setKeyword(value);
                fetchStaffs(1, pagination.pageSize, value, filters);
              }}
            />
            <Select
              allowClear
              placeholder="Role"
              style={{ width: 170 }}
              value={filters.role}
              options={STAFF_ROLE_OPTIONS}
              onChange={(value) => handleFilterChange("role", value)}
            />
            <Select
              allowClear
              placeholder="Status"
              style={{ width: 140 }}
              value={filters.isActive}
              options={STATUS_OPTIONS}
              onChange={(value) => handleFilterChange("isActive", value)}
            />
          </Space>
        }
      >
        <Table
          rowKey={getStaffId}
          loading={loading}
          dataSource={staffs}
          columns={columns}
          scroll={{ x: 850 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `${total} staffs`,
          }}
          onChange={(pager) =>
            fetchStaffs(pager.current, pager.pageSize, keyword, filters)
          }
        />
      </Card>
    </div>
  );
}
