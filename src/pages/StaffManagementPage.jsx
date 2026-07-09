import React, { useEffect, useMemo, useState } from "react";
import {
  EditOutlined,
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
  TeamOutlined,
} from "@ant-design/icons";
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
  Table,
  Tag,
  Typography,
  message,
  Switch,
} from "antd";
import PageHeader from "../components/PageHeader";
import { roleColors, roleLabels } from "../constants/roles";
import { useAuth } from "../features/auth/AuthContext";
import { staffService } from "../features/staffs/staffService";
import { formatDateTime, normalizePhone } from "../utils/format";

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
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [changingRoleId, setChangingRoleId] = useState(null);
  const [saving, setSaving] = useState(false);
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

  const roleChangeOptions = useMemo(() => {
    if (user?.role === "ADMIN") return STAFF_ROLE_OPTIONS;

    return STAFF_ROLE_OPTIONS.filter((option) =>
      ["COUNTER_STAFF", "KITCHEN_STAFF"].includes(option.value),
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
      const data = await staffService.getStaffById(getStaffId(staff));
      setSelectedStaff(data);
    } catch (error) {
      message.error(error.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const openUpdateModal = (staff) => {
    setSelectedStaff(staff);
    form.setFieldsValue({
      fullName: staff.fullName,
      email: staff.email,
      phone: staff.phone || "",
      role: staff.role,
      isActive: staff.isActive,
    });
    setFormOpen(true);
  };

  const handleRoleChange = async (staff, role) => {
    const staffId = getStaffId(staff);
    setChangingRoleId(staffId);

    try {
      const updatedStaff = await staffService.changeStaffRole(staffId, role);
      message.success(`Updated role for ${updatedStaff.fullName}`);

      if (getStaffId(selectedStaff) === staffId) {
        setSelectedStaff(updatedStaff);
      }

      await fetchStaffs(
        pagination.current,
        pagination.pageSize,
        keyword,
        filters,
      );
    } catch (error) {
      message.error(error.message);
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
    const staffId = getStaffId(selectedStaff);
    setSaving(true);

    try {
      const updatedStaff = await staffService.updateStaff(staffId, {
        ...values,
        phone: values.phone ? normalizePhone(values.phone) : null,
      });

      message.success(`Updated ${updatedStaff.fullName}`);
      setFormOpen(false);

      if (getStaffId(selectedStaff) === staffId) {
        setSelectedStaff(updatedStaff);
      }

      await fetchStaffs(
        pagination.current,
        pagination.pageSize,
        keyword,
        filters,
      );
    } catch (error) {
      message.error(error.message);
    } finally {
      setSaving(false);
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
        title="Update Staff Information"
        open={formOpen}
        onCancel={() => setFormOpen(false)}
        onOk={handleSubmitStaff}
        okText="Save changes"
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
          <Form.Item
            name="phone"
            label="Phone"
            rules={[
              {
                pattern: /^[0-9]{9,15}$/,
                message: "Phone must contain 9-15 digits",
              },
            ]}
          >
            <Input placeholder="0900000000" />
          </Form.Item>
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: "Please select role" }]}
          >
            <Select options={roleChangeOptions} />
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
