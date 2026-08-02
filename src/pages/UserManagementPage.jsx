import React, { useState, useEffect, useMemo } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
} from "antd";
import {
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import PageHeader from "../components/PageHeader";
import { COLORS } from "../features/orders/utils/orderUtils.jsx";
import { USER_ROLES, roleColors, roleLabels } from "../constants/roles";
import { useAuth } from "../features/auth/AuthContext";
import { formatDateTime, normalizePhone } from "../utils/format";

// Components
import UserDetailDrawer from "../features/users/UserDetailDrawer";
import UserFormModal from "../features/users/UserFormModal";

// Hooks
import { useUsers } from "../features/users/hooks/useUsers";

// Services
import { userService } from "../features/users/userService";

const statusOptions = [
  { label: "All statuses", value: "" },
  { label: "Active", value: "true" },
  { label: "Inactive", value: "false" },
];

const getUserId = (user) => user?._id || user?.id || user?.userId;

export default function UserManagementPage() {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const { Search } = Input;

  // Local state for modals and selection
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedUser, setSelectedUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [filters, setFilters] = useState({
    role: undefined,
    isActive: undefined,
  });

  // Custom hook
  const {
    users,
    loading,
    saving,
    changingRoleId,
    pagination,
    fetchUsers,
    createUser,
    updateUser,
    changeUserRole,
    getUserById,
  } = useUsers();

  // Initial data fetch
  useEffect(() => {
    fetchUsers(1, 10, "", filters);
  }, []);

  const stats = useMemo(() => {
    const active = users.filter((user) => user.isActive).length;
    return { active, inactive: users.length - active };
  }, [users]);

  const roleChangeOptions = useMemo(() => {
    if (user?.role === "ADMIN") return USER_ROLES;

    return USER_ROLES.filter((option) =>
      ["COUNTER_STAFF", "KITCHEN_STAFF", "CUSTOMER"].includes(option.value),
    );
  }, [user?.role]);

  const canChangeRole = (targetUser) => {
    if (getUserId(targetUser) === getUserId(user)) return false;
    if (user?.role === "ADMIN") return true;

    return ["COUNTER_STAFF", "KITCHEN_STAFF", "CUSTOMER"].includes(
      targetUser?.role,
    );
  };

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
    try {
      const payload = { ...values, phone: normalizePhone(values.phone) };
      if (modalMode === "create") await createUser(payload);
      else {
        const id = getUserId(selectedUser);
        if (!id) throw new Error("User ID is missing");
        await updateUser(id, payload);
      }
      console.log(modalMode === "create" ? "User created" : "User updated");
      setModalOpen(false);
      await fetchUsers(
        pagination.current,
        pagination.pageSize,
        keyword,
        filters,
      );
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleStatusChange = async (user, checked) => {
    try {
      const id = getUserId(user);
      if (!id) throw new Error("User ID is missing");

      await userService.updateUserStatus(id, checked);
      console.log(
        `${checked ? "Activated" : "Deactivated"} ${user.fullName}`,
      );
      await fetchUsers(
        pagination.current,
        pagination.pageSize,
        keyword,
        filters,
      );
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleRoleChange = async (targetUser, role) => {
    const userId = getUserId(targetUser);

    try {
      if (!userId) throw new Error("User ID is missing");

      await changeUserRole(userId, role);
      console.log(`Updated role for ${targetUser.fullName}`);

      if (getUserId(selectedUser) === userId) {
        setSelectedUser((prev) => (prev ? { ...prev, role } : prev));
      }

      await fetchUsers(
        pagination.current,
        pagination.pageSize,
        keyword,
        filters,
      );
    } catch (error) {
      console.error(error.message);
    }
  };

  const confirmRoleChange = (targetUser, role) => {
    Modal.confirm({
      title: "Change user role?",
      content: `${targetUser.fullName} will be changed from ${roleLabels[targetUser.role]} to ${roleLabels[role]}.`,
      okText: "Change Role",
      onOk: () => handleRoleChange(targetUser, role),
    });
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
          loading={changingRoleId === getUserId(record)}
          disabled={
            changingRoleId === getUserId(record) || !canChangeRole(record)
          }
          options={
            canChangeRole(record)
              ? roleChangeOptions
              : USER_ROLES.filter((option) => option.value === role)
          }
          onChange={(value) => confirmRoleChange(record, value)}
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
        <Card
          className="dashboard-card"
          styles={{ body: { padding: "16px 18px" } }}
          style={{
            borderRadius: 14,
            borderTop: `3px solid ${COLORS.orange}`,
            boxShadow: "0 2px 10px rgba(20, 20, 43, 0.05)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">Current page users</div>
              <div className="mt-1 text-2xl font-bold" style={{ color: COLORS.orange }}>
                {users.length}
              </div>
            </div>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `${COLORS.orange}1a`,
                color: COLORS.orange,
                fontSize: 18,
              }}
            >
              <UserSwitchOutlined />
            </div>
          </div>
        </Card>

        <Card
          className="dashboard-card"
          styles={{ body: { padding: "16px 18px" } }}
          style={{
            borderRadius: 14,
            borderTop: `3px solid ${COLORS.green}`,
            boxShadow: "0 2px 10px rgba(20, 20, 43, 0.05)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">Active on page</div>
              <div className="mt-1 text-2xl font-bold" style={{ color: COLORS.green }}>
                {stats.active}
              </div>
            </div>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `${COLORS.green}1a`,
                color: COLORS.green,
                fontSize: 18,
              }}
            >
              ✓
            </div>
          </div>
        </Card>

        <Card
          className="dashboard-card"
          styles={{ body: { padding: "16px 18px" } }}
          style={{
            borderRadius: 14,
            borderTop: `3px solid ${COLORS.red}`,
            boxShadow: "0 2px 10px rgba(20, 20, 43, 0.05)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">Inactive on page</div>
              <div className="mt-1 text-2xl font-bold" style={{ color: COLORS.red }}>
                {stats.inactive}
              </div>
            </div>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `${COLORS.red}1a`,
                color: COLORS.red,
                fontSize: 18,
              }}
            >
              ✗
            </div>
          </div>
        </Card>
      </div>

      <Card
        title="Users"
        style={{ borderRadius: 14, boxShadow: "0 2px 10px rgba(20, 20, 43, 0.05)" }}
        extra={
          <Space wrap>
            <Search
              placeholder="Search name, email or phone..."
              allowClear
              enterButton={<SearchOutlined />}
              style={{ width: 280 }}
              onSearch={(value) => {
                setKeyword(value);
                fetchUsers(1, pagination.pageSize, value, filters);
              }}
            />

            <Select
              placeholder="Role"
              allowClear
              style={{ width: 150 }}
              value={filters.role}
              onChange={(value) => handleFilterChange("role", value)}
              options={USER_ROLES}
            />

            <Select
              placeholder="Status"
              allowClear
              style={{ width: 140 }}
              value={filters.isActive}
              onChange={(value) => handleFilterChange("isActive", value)}
              options={[
                {
                  label: "Active",
                  value: true,
                },
                {
                  label: "Inactive",
                  value: false,
                },
              ]}
            />
          </Space>
        }
      >
        <Table
          rowKey={(record) => getUserId(record)}
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
            onChange: (page, pageSize) =>
              fetchUsers(page, pageSize, keyword, filters),
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
