import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Descriptions,
  Drawer,
  Input,
  Popconfirm,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  LinkOutlined,
  PhoneOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  ShopOutlined,
  UserOutlined,
  CheckCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
import PageHeader from "../components/PageHeader";
import { COLORS } from "../features/orders/utils/orderUtils.jsx";
import { formatDateTime } from "../utils/format";

// Components
import SupplierFormModal from "../features/suppliers/SupplierFormModal";

// Hooks
import { useSuppliers } from "../features/suppliers/hooks/useSuppliers";

const statusOptions = [
  { label: "Active", value: "true" },
  { label: "Inactive", value: "false" },
];

export default function SupplierManagementPage() {
  const navigate = useNavigate();
  const { Search } = Input;

  // Local state for modals and selection
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [filters, setFilters] = useState({ isActive: undefined });

  // Custom hook
  const {
    suppliers,
    loading,
    saving,
    deleting,
    pagination,
    fetchSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    getSupplierById,
  } = useSuppliers();

  // Initial data fetch
  useEffect(() => {
    fetchSuppliers(1, 10, "", filters);
  }, []);

  const stats = useMemo(() => {
    const active = suppliers.filter((s) => s.isActive).length;
    return { active, inactive: suppliers.length - active };
  }, [suppliers]);

  const handleStatusFilter = (value) => {
    const newFilters = { ...filters, isActive: value };
    setFilters(newFilters);
    fetchSuppliers(1, pagination.pageSize, keyword, newFilters);
  };

  const openDetailDrawer = async (supplier) => {
    setSelectedSupplier(supplier);
    setDetailOpen(true);
    setDetailLoading(true);

    try {
      const data = await getSupplierById(supplier._id);
      setSelectedSupplier(data);
    } catch (error) {
      console.error(error.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const openCreateModal = () => {
    setSelectedSupplier(null);
    setFormMode("create");
    setFormOpen(true);
  };

  const openEditModal = (supplier) => {
    setSelectedSupplier(supplier);
    setFormMode("edit");
    setFormOpen(true);
  };

  const handleSubmitSupplier = async (values) => {
    try {
      const saved =
        formMode === "create"
          ? await createSupplier(values)
          : await updateSupplier(selectedSupplier._id, values);

      console.log(
        formMode === "create" ? "Supplier created" : "Supplier updated",
      );
      setFormOpen(false);

      if (detailOpen && selectedSupplier?._id === saved._id) {
        setSelectedSupplier(saved);
      }

      await fetchSuppliers(
        formMode === "create" ? 1 : pagination.current,
        pagination.pageSize,
        keyword,
        filters,
      );
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleDeleteSupplier = async (id) => {
    try {
      await deleteSupplier(id);
      console.log("Supplier deactivated successfully");

      if (detailOpen && selectedSupplier?._id === id) {
        setDetailOpen(false);
        setSelectedSupplier(null);
      }

      await fetchSuppliers(
        suppliers.length === 1 && pagination.current > 1
          ? pagination.current - 1
          : pagination.current,
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
      title: "Supplier",
      dataIndex: "name",
      width: 250,
      render: (name, record) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-unilife-soft text-unilife">
            <ShopOutlined />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-slate-900 truncate">{name}</div>
            {record.address && (
              <div className="truncate text-xs text-slate-400">
                {record.address}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Contact",
      dataIndex: "contactName",
      width: 200,
      render: (contactName, record) => (
        <div className="min-w-0">
          {contactName ? (
            <div className="flex items-center gap-1.5 text-sm text-slate-700 truncate">
              <UserOutlined className="flex-shrink-0 text-slate-400" />
              <span className="truncate">{contactName}</span>
            </div>
          ) : null}
          {record.phone ? (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 truncate">
              <PhoneOutlined className="flex-shrink-0" />
              <span className="truncate">{record.phone}</span>
            </div>
          ) : null}
          {!contactName && !record.phone && (
            <span className="text-slate-400">—</span>
          )}
        </div>
      ),
    },
    {
      title: "Note",
      dataIndex: "note",
      width: 200,
      ellipsis: true,
      render: (note) =>
        note ? (
          <span className="text-sm text-slate-600" title={note}>
            {note}
          </span>
        ) : (
          <span className="text-slate-300">—</span>
        ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      width: 100,
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      width: 150,
      render: formatDateTime,
    },
    {
      title: "Updated At",
      dataIndex: "updatedAt",
      width: 150,
      render: formatDateTime,
    },
    {
      title: "Actions",
      fixed: "right",
      width: 130,
      render: (_, record) => (
        <Space size={6}>
          <Tooltip title="View details">
            <Button
              icon={<EyeOutlined />}
              aria-label={`View ${record.name}`}
              onClick={() => openDetailDrawer(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                openEditModal(record);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Deactivate supplier"
            description="This supplier will be deactivated and hidden from the list."
            okText="Deactivate"
            okButtonProps={{ danger: true }}
            cancelText="Cancel"
            onConfirm={(e) => {
              e.stopPropagation();
              handleDeleteSupplier(record._id);
            }}
          >
            <Tooltip title="Deactivate">
              <Button
                danger
                icon={<DeleteOutlined />}
                loading={deleting === record._id}
                onClick={(e) => e.stopPropagation()}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Suppliers Management"
        description="Manage ingredient and product suppliers for the UniLife cafeteria."
        breadcrumbs={["Dashboard", "Suppliers"]}
        extra={
          <Space wrap>
            <Button
              icon={<ReloadOutlined />}
              onClick={() =>
                fetchSuppliers(
                  pagination.current,
                  pagination.pageSize,
                  keyword,
                  filters,
                )
              }
            >
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateModal}
            >
              Create Supplier
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
              <div className="text-sm text-slate-500">On this page</div>
              <div className="mt-1 text-2xl font-bold" style={{ color: COLORS.orange }}>
                {suppliers.length}
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
              <ShopOutlined />
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
              <div className="text-sm text-slate-500">Active</div>
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
              <div className="text-sm text-slate-500">Inactive</div>
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
        title="Supplier List"
        style={{ borderRadius: 14, boxShadow: "0 2px 10px rgba(20, 20, 43, 0.05)" }}
        extra={
          <Space wrap>
            <Search
              allowClear
              enterButton={<SearchOutlined />}
              placeholder="Search supplier..."
              style={{ width: 280 }}
              onSearch={(value) => {
                setKeyword(value);
                fetchSuppliers(1, pagination.pageSize, value, filters);
              }}
            />
            <Select
              allowClear
              placeholder="Status"
              style={{ width: 150 }}
              options={statusOptions}
              onChange={handleStatusFilter}
            />
          </Space>
        }
      >
        <Table
          rowKey="_id"
          loading={loading}
          dataSource={suppliers}
          columns={columns}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `${total} suppliers`,
            onChange: (page, pageSize) =>
              fetchSuppliers(page, pageSize, keyword, filters),
          }}
        />
      </Card>

      <Drawer
        title="Supplier Details"
        placement="right"
        width={520}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        extra={
          selectedSupplier && (
            <Space>
              <Button
                icon={<LinkOutlined />}
                onClick={() => navigate(`/suppliers/${selectedSupplier._id}`)}
              >
                Full Detail
              </Button>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => {
                  setDetailOpen(false);
                  openEditModal(selectedSupplier);
                }}
              >
                Edit
              </Button>
            </Space>
          )
        }
      >
        <Spin spinning={detailLoading}>
          {selectedSupplier && (
            <Descriptions bordered column={1} size="middle">
              <Descriptions.Item label="Supplier Name">
                <span className="font-semibold">{selectedSupplier.name}</span>
              </Descriptions.Item>

              <Descriptions.Item label="Contact Person">
                {selectedSupplier.contactName || (
                  <span className="text-slate-400">Not provided</span>
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Phone">
                {selectedSupplier.phone ? (
                  <a
                    href={`tel:${selectedSupplier.phone}`}
                    className="text-unilife"
                  >
                    {selectedSupplier.phone}
                  </a>
                ) : (
                  <span className="text-slate-400">Not provided</span>
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Address">
                {selectedSupplier.address || (
                  <span className="text-slate-400">Not provided</span>
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Note">
                {selectedSupplier.note || (
                  <span className="text-slate-400">No notes</span>
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Status">
                <Tag color={selectedSupplier.isActive ? "green" : "red"}>
                  {selectedSupplier.isActive ? "Active" : "Inactive"}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Supplier ID">
                <code className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                  {selectedSupplier.supplierId || selectedSupplier._id}
                </code>
              </Descriptions.Item>

              <Descriptions.Item label="Created At">
                {formatDateTime(selectedSupplier.createdAt)}
              </Descriptions.Item>

              <Descriptions.Item label="Updated At">
                {formatDateTime(selectedSupplier.updatedAt)}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Spin>
      </Drawer>

      {/* Form Modal */}
      <SupplierFormModal
        open={formOpen}
        mode={formMode}
        initialValues={formMode === "edit" ? selectedSupplier : null}
        loading={saving}
        onCancel={() => setFormOpen(false)}
        onSubmit={handleSubmitSupplier}
      />
    </div>
  );
}
