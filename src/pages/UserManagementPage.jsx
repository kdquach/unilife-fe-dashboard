import React from "react";
import {
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Form,
  Input,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  message,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/PageHeader";
import { USER_ROLES, roleColors, roleLabels } from "../constants/roles";
import UserDetailDrawer from "../features/users/UserDetailDrawer";
import UserFormModal from "../features/users/UserFormModal";
import { userService } from "../features/users/userService";
import { formatDateTime, normalizePhone } from "../utils/format";

const statusOptions = [
  { label: "All statuses", value: "" },
  { label: "Active", value: "true" },
  { label: "Inactive", value: "false" },
];

export default function UserManagementPage() {
  const [form] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedUser, setSelectedUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const filters = Form.useWatch([], form) || {};

  const fetchUsers = async (
    page = pagination.current,
    pageSize = pagination.pageSize,
  ) => {
    setLoading(true);
    try {
      const values = form.getFieldsValue();
      const response = await userService.getUsers({
        page,
        limit: pageSize,
        keyword: values.keyword,
        role: values.role,
        status: values.status,
      });
      setUsers(response.data);
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
    fetchUsers(1, pagination.pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const active = users.filter((user) => user.isActive).length;
    return { active, inactive: users.length - active };
  }, [users]);

  const openCreateModal = () => {
    setSelectedUser(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setModalMode("edit");
    setModalOpen(true);
  };

  const openDrawer = (user) => {
    setSelectedUser(user);
    setDrawerOpen(true);
  };

  const handleSubmitUser = async (values) => {
    setSaving(true);
    try {
      const payload = { ...values, phone: normalizePhone(values.phone) };
      if (modalMode === "create") await userService.createUser(payload);
      else await userService.updateUser(selectedUser.id, payload);
      message.success(modalMode === "create" ? "User created" : "User updated");
      setModalOpen(false);
      await fetchUsers(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (user, checked) => {
    try {
      await userService.updateUserStatus(user.id, checked);
      message.success(
        `${checked ? "Activated" : "Deactivated"} ${user.fullName}`,
      );
      await fetchUsers(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error(error.message);
    }
  };

  const handleRoleChange = async (user, role) => {
    try {
      await userService.updateUserRole(user.id, role);
      message.success(`Updated role for ${user.fullName}`);
      await fetchUsers(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error(error.message);
    }
  };

  const columns = [
    {
      title: "User",
      dataIndex: "fullName",
      render: (_, record) => (
        <div>
          <div className="font-semibold text-slate-900">{record.fullName}</div>
          <div className="text-sm text-slate-500">{record.email}</div>
        </div>
      ),
    },
    { title: "Phone", dataIndex: "phone", width: 140 },
    {
      title: "Role",
      dataIndex: "role",
      width: 210,
      render: (role, record) => (
        <Select
          value={role}
          className="w-44"
          options={USER_ROLES}
          onChange={(value) => handleRoleChange(record, value)}
        />
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      width: 160,
      render: (value, record) => (
        <Popconfirm
          title={value ? "Deactivate account?" : "Activate account?"}
          description={`This will ${value ? "disable" : "enable"} ${record.fullName}.`}
          onConfirm={() => handleStatusChange(record, !value)}
        >
          <Switch
            checked={value}
            checkedChildren="Active"
            unCheckedChildren="Inactive"
          />
        </Popconfirm>
      ),
    },
    {
      title: "Role tag",
      dataIndex: "role",
      width: 150,
      render: (role) => <Tag color={roleColors[role]}>{roleLabels[role]}</Tag>,
    },
    {
      title: "Created at",
      dataIndex: "createdAt",
      render: formatDateTime,
      width: 180,
    },
    {
      title: "Actions",
      fixed: "right",
      width: 140,
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => openDrawer(record)} />
          <Button
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="User Management"
        description="Sprint 1 Admin function: view, search, filter, update role and activate/deactivate user accounts."
        breadcrumbs={["Dashboard", "User Management"]}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
          >
            Create User
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="dashboard-card">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-unilife-soft text-xl text-unilife">
              <UserSwitchOutlined />
            </div>
            <div>
              <div className="text-sm text-slate-500">Current page users</div>
              <div className="text-2xl font-bold text-slate-950">
                {users.length}
              </div>
            </div>
          </div>
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

      <Card className="dashboard-card mb-4">
        <Form
          form={form}
          layout="vertical"
          initialValues={{ keyword: "", role: undefined, status: "" }}
        >
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr_1fr_auto] lg:items-end">
            <Form.Item name="keyword" label="Keyword" className="!mb-0">
              <Input
                prefix={<SearchOutlined />}
                placeholder="Search name, email or phone"
                allowClear
              />
            </Form.Item>
            <Form.Item name="role" label="Role" className="!mb-0">
              <Select placeholder="All roles" allowClear options={USER_ROLES} />
            </Form.Item>
            <Form.Item name="status" label="Status" className="!mb-0">
              <Select options={statusOptions} />
            </Form.Item>
            <Space>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => fetchUsers(1, pagination.pageSize)}
              >
                Search
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  form.resetFields();
                  setTimeout(() => fetchUsers(1, pagination.pageSize), 0);
                }}
              >
                Reset
              </Button>
            </Space>
          </div>
        </Form>
      </Card>

      <Card className="dashboard-card">
        <Table
          rowKey="id"
          loading={loading}
          dataSource={users}
          columns={columns}
          scroll={{ x: 1050 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `${total} users`,
            onChange: (page, pageSize) => fetchUsers(page, pageSize),
          }}
        />
      </Card>

      <UserFormModal
        open={modalOpen}
        mode={modalMode}
        initialValues={selectedUser}
        loading={saving}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleSubmitUser}
      />

      <UserDetailDrawer
        open={drawerOpen}
        user={selectedUser}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
