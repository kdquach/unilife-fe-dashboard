import React, { useState, useEffect, useMemo } from "react";
import {
  Avatar,
  Button,
  Card,
  Descriptions,
  Drawer,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Spin,
  Switch,
  Table,
  Tag,
  Typography,
} from "antd";
import {
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  UserSwitchOutlined,
  CheckCircleOutlined,
  StopOutlined 
} from "@ant-design/icons";
import PageHeader from "../components/PageHeader";
import { COLORS } from "../features/orders/utils/orderUtils.jsx";
import { roleColors, roleLabels } from "../constants/roles";
import { useAuth } from "../features/auth/AuthContext";
import { formatDateTime, normalizePhone } from "../utils/format";

// Hooks
import { useStaffs } from "../features/staffs/hooks/useStaffs";

// Services
import { staffService } from "../features/staffs/staffService";

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
  const { user } = useAuth();
  const [form] = Form.useForm();
  
  // Local state for modals and selection
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("edit");
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [changingRoleId, setChangingRoleId] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [filters, setFilters] = useState({
    role: undefined,
    isActive: undefined,
  });

  // Custom hook
  const { staffs, loading, saving, pagination, fetchStaffs, updateStaff, getStaffById } = useStaffs();

  // Initial data fetch
  useEffect(() => {
    fetchStaffs(1, 10, "", filters);
  }, []);

  const stats = {
    total: staffs.length,
    active: staffs.filter((staff) => staff.isActive).length,
    inactive: staffs.length - staffs.filter((staff) => staff.isActive).length,
  };

  const roleChangeOptions = useMemo(() => {
    if (user?.role === "ADMIN") return STAFF_ROLE_OPTIONS;

    return STAFF_ROLE_OPTIONS.filter((option) =>
      ["COUNTER_STAFF", "KITCHEN_STAFF"].includes(option.value),
    );
  }, [user?.role]);

  const createRoleOptions = useMemo(() => {
    const allowedRoles =
      user?.role === "ADMIN"
        ? ["MANAGER", "COUNTER_STAFF", "KITCHEN_STAFF"]
        : ["COUNTER_STAFF", "KITCHEN_STAFF"];

    return STAFF_ROLE_OPTIONS.filter((option) =>
      allowedRoles.includes(option.value),
    );
  }, [user?.role]);

  const canChangeRole = (staff) => {
    if (getStaffId(staff) === getStaffId(user)) return false;
    if (user?.role === "ADMIN") return true;

    return ["COUNTER_STAFF", "KITCHEN_STAFF"].includes(staff?.role);
  };

  const canManageStaff = (staff) => canChangeRole(staff);

  const handleFilterChange = (key, value) => {
    const nextFilters = { ...filters, [key]: value };
    setFilters(nextFilters);
    fetchStaffs(1, pagination.pageSize, keyword, nextFilters);
  };

  const openDetailDrawer = async (staff) => {
    setSelectedStaff(staff);
    setDetailOpen(true);
    setDetailLoading(true);

    try {
      const data = await getStaffById(getStaffId(staff));
      setSelectedStaff(data);
    } catch (error) {
      console.error(error.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const openUpdateModal = (staff) => {
    setSelectedStaff(staff);
    setFormMode("edit");
    form.setFieldsValue({
      fullName: staff.fullName,
      email: staff.email,
      phone: staff.phone || "",
      role: staff.role,
      isActive: staff.isActive,
      password: undefined,
    });
    setFormOpen(true);
  };

  const openCreateModal = () => {
    setSelectedStaff(null);
    setFormMode("create");
    form.setFieldsValue({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      role: createRoleOptions[0]?.value,
      isActive: true,
    });
    setFormOpen(true);
  };

  const handleRoleChange = async (staff, role) => {
    const staffId = getStaffId(staff);
    setChangingRoleId(staffId);

    try {
      const updatedStaff = await staffService.changeStaffRole(staffId, role);
      console.log(`Updated role for ${updatedStaff.fullName}`);

      if (getStaffId(selectedStaff) === staffId) {
        setSelectedStaff(updatedStaff);
      }

      await fetchStaffs(pagination.current, pagination.pageSize, keyword, filters);
    } catch (error) {
      console.error(error.message);
    } finally {
      setChangingRoleId(null);
    }
  };

  const confirmRoleChange = (staff, role) => {
    Modal.confirm({
      title: "Change staff role?",
      content: `${staff.fullName} will be changed from ${roleLabels[staff.role]} to ${roleLabels[role]}.`,
      okText: "Change Role",
      onOk: () => handleRoleChange(staff, role),
    });
  };

  const handleSubmitStaff = async () => {
    const values = await form.validateFields();

    try {
      const payload = {
        ...values,
        phone: values.phone ? normalizePhone(values.phone) : null,
      };

      const savedStaff =
        formMode === "create"
          ? await staffService.createStaff(payload)
          : await updateStaff(getStaffId(selectedStaff), payload);

      console.log(
        formMode === "create"
          ? `Created ${savedStaff.fullName}`
          : `Updated ${savedStaff.fullName}`,
      );
      setFormOpen(false);

      if (
        formMode === "edit" &&
        getStaffId(selectedStaff) === getStaffId(savedStaff)
      ) {
        setSelectedStaff(savedStaff);
      }

      await fetchStaffs(
        formMode === "create" ? 1 : pagination.current,
        pagination.pageSize,
        keyword,
        filters,
      );
    } catch (error) {
      console.error(error.message);
    }
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
      width: 210,
      render: (role, record) => (
        <Select
          value={role}
          className="w-44"
          loading={changingRoleId === getStaffId(record)}
          disabled={
            changingRoleId === getStaffId(record) || !canChangeRole(record)
          }
          options={
            canChangeRole(record)
              ? roleChangeOptions
              : STAFF_ROLE_OPTIONS.filter((option) => option.value === role)
          }
          onChange={(value) => confirmRoleChange(record, value)}
        />
      ),
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
    {
      title: "Actions",
      fixed: "right",
      width: 130,
      render: (_, record) => (
        <Space size={6}>
          <Button
            icon={<EyeOutlined />}
            onClick={() => openDetailDrawer(record)}
          />
          <Button
            icon={<EditOutlined />}
            disabled={!canManageStaff(record)}
            onClick={() => openUpdateModal(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Staff Management"
        description="View and manage staff accounts used by the UniLife operation team."
        breadcrumbs={["Dashboard", "Staff Management"]}
        extra={
          <Space wrap>
            <Button
              icon={<ReloadOutlined />}
              loading={loading}
              onClick={() =>
                fetchStaffs(pagination.current, pagination.pageSize, keyword, filters)
              }
            >
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateModal}
            >
              Create Staff
            </Button>
          </Space>
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
                <div className="text-sm text-slate-500">Current page</div>
                <div className="mt-1 text-2xl font-bold" style={{ color: COLORS.orange }}>
                  {stats.total}
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
                <CheckCircleOutlined />
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
                <StopOutlined />
              </div>
            </div>
          </Card>
        </div>

        <Card
          title="Staffs"
          style={{ borderRadius: 14, boxShadow: "0 2px 10px rgba(20, 20, 43, 0.05)" }}
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
            scroll={{ x: 950 }}
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

        <Drawer
          title="Staff Detail"
          width={560}
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
        >
          <Spin spinning={detailLoading}>
            {selectedStaff && (
              <>
                <div className="mb-6 flex items-center gap-4 rounded-3xl bg-unilife-soft p-5">
                  <Avatar size={72} className="bg-unilife text-xl font-bold">
                    {selectedStaff.fullName?.[0]}
                  </Avatar>
                  <div>
                    <Typography.Title level={4} className="!mb-1">
                      {selectedStaff.fullName}
                    </Typography.Title>
                    <Typography.Text className="text-slate-500">
                      {selectedStaff.email}
                    </Typography.Text>
                    <div className="mt-2 flex gap-2">
                      <Tag color={roleColors[selectedStaff.role]}>
                        {roleLabels[selectedStaff.role]}
                      </Tag>
                      <Tag color={selectedStaff.isActive ? "green" : "red"}>
                        {selectedStaff.isActive ? "Active" : "Inactive"}
                      </Tag>
                    </div>
                  </div>
                </div>

                <Descriptions bordered column={1}>
                  <Descriptions.Item label="Staff ID">
                    {getStaffId(selectedStaff)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Full name">
                    {selectedStaff.fullName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    {selectedStaff.email}
                  </Descriptions.Item>
                  <Descriptions.Item label="Phone">
                    {selectedStaff.phone || "-"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Role">
                    {roleLabels[selectedStaff.role]}
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    {selectedStaff.isActive ? "Active" : "Inactive"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Created at">
                    {formatDateTime(selectedStaff.createdAt)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Updated at">
                    {formatDateTime(selectedStaff.updatedAt)}
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}
          </Spin>
        </Drawer>

        <Modal
          title={
            formMode === "create" ? "Create Staff" : "Update Staff Information"
          }
        open={formOpen}
        onCancel={() => setFormOpen(false)}
        onOk={handleSubmitStaff}
        okText={formMode === "create" ? "Create" : "Save changes"}
        confirmLoading={saving}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="pt-4">
          <Form.Item
            name="fullName"
            label="Full name"
            rules={[
              { required: true, message: "Please enter full name" },
              { whitespace: true, message: "Full name cannot be empty" },
            ]}
          >
            <Input placeholder="Nguyen Van A" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter email" },
              { type: "email", message: "Invalid email" },
            ]}
          >
            <Input placeholder="staff@unilife.local" />
          </Form.Item>
          {formMode === "create" && (
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: "Please enter password" },
                { min: 6, message: "Password must be at least 6 characters" },
              ]}
            >
              <Input.Password placeholder="Enter temporary password" />
            </Form.Item>
          )}
          <Form.Item
            name="phone"
            label="Phone"
            normalize={(value) => (value ? value.replace(/\D/g, "") : "")}
            rules={[
              {
                pattern: /^[0-9]{9,15}$/,
                message: "Phone must contain 9-15 digits",
              },
            ]}
          >
            <Input placeholder="0900000000" maxLength={15} />
          </Form.Item>
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: "Please select role" }]}
          >
            <Select
              options={
                formMode === "create" ? createRoleOptions : roleChangeOptions
              }
            />
          </Form.Item>
          <Form.Item
            name="isActive"
            label="Active account"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
      </div>
  );
}
