import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
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
  message,
} from "antd";
import PageHeader from "../components/PageHeader";
import SupplierFormModal from "../features/suppliers/SupplierFormModal";
import { supplierService } from "../features/suppliers/supplierService";
import { formatDateTime } from "../utils/format";

const statusOptions = [
  { label: "Active", value: "true" },
  { label: "Inactive", value: "false" },
];

export default function SupplierManagementPage() {
  const navigate = useNavigate();

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [filters, setFilters] = useState({ isActive: undefined });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const { Search } = Input;

  const fetchSuppliers = async (
    page = pagination.current,
    pageSize = pagination.pageSize,
    searchKeyword = keyword,
    currentFilters = filters,
  ) => {
    setLoading(true);

    try {
      const response = await supplierService.getSuppliers({
        page,
        limit: pageSize,
        keyword: searchKeyword,
        ...currentFilters,
      });

      setSuppliers(response.data);
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
    fetchSuppliers(1, pagination.pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const data = await supplierService.getSupplierById(supplier._id);
      setSelectedSupplier(data);
    } catch (error) {
      message.error(error.message);
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
    setSaving(true);

    try {
      const saved =
        formMode === "create"
          ? await supplierService.createSupplier(values)
          : await supplierService.updateSupplier(selectedSupplier._id, values);

      message.success(
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
      message.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSupplier = async (id) => {
    setDeleting(id);

    try {
      await supplierService.deleteSupplier(id);
      message.success("Supplier deleted");

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
      message.error(error.message);
    } finally {
      setDeleting(null);
    }
  };

  const columns = [
    {
      title: "Supplier",
      dataIndex: "name",
      render: (name, record) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-unilife-soft text-unilife">
            <ShopOutlined />
          </div>
          <div>
            <div className="font-semibold text-slate-900">{name}</div>
            {record.address && (
              <div className="max-w-xs truncate text-xs text-slate-400">
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
      width: 180,
      render: (contactName, record) => (
        <div>
          {contactName ? (
            <div className="flex items-center gap-1.5 text-sm text-slate-700">
              <UserOutlined className="text-slate-400" />
              {contactName}
            </div>
          ) : null}
          {record.phone ? (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <PhoneOutlined />
              {record.phone}
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
      width: 300,
      render: (note) =>
        note ? (
          <span
            className="block max-w-[180px] truncate text-sm text-slate-600"
            title={note}
          >
            {note}
          </span>
        ) : (
          <span className="text-slate-300">—</span>
        ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      width: 120,
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      width: 165,
      render: formatDateTime,
    },
    {
      title: "Updated At",
      dataIndex: "updatedAt",
      width: 165,
      render: formatDateTime,
    },
    {
      title: "Actions",
      fixed: "right",
      width: 150,
      render: (_, record) => (
        <Space size={6}>
          <Button
            icon={<EyeOutlined />}
            onClick={() => openDetailDrawer(record)}
          />
          <Button
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          />
          <Popconfirm
            title="Delete supplier"
            description="Are you sure you want to delete this supplier?"
            okText="Delete"
            okButtonProps={{ danger: true }}
            cancelText="Cancel"
            onConfirm={() => handleDeleteSupplier(record._id)}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              loading={deleting === record._id}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Suppliers"
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
              Add Supplier
            </Button>
          </Space>
        }
      />

      {/* Stats */}
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="dashboard-card">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-unilife-soft text-xl text-unilife">
              <TeamOutlined />
            </div>
            <div>
              <div className="text-sm text-slate-500">On this page</div>
              <div className="text-2xl font-bold text-slate-950">
                {suppliers.length}
              </div>
            </div>
          </div>
        </Card>

        <Card className="dashboard-card">
          <div className="text-sm text-slate-500">Active</div>
          <div className="mt-1 text-2xl font-bold text-green-600">
            {stats.active}
          </div>
        </Card>

        <Card className="dashboard-card">
          <div className="text-sm text-slate-500">Inactive</div>
          <div className="mt-1 text-2xl font-bold text-red-500">
            {stats.inactive}
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card
        className="dashboard-card"
        title="Supplier List"
        extra={
          <Space wrap>
            <Search
              allowClear
              enterButton={<SearchOutlined />}
              placeholder="Search supplier..."
              style={{ width: 260 }}
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
          scroll={{ x: 1100 }}
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

      {/* Detail Drawer */}
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
