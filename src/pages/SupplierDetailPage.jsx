import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeftOutlined,
  BoxPlotOutlined,
  EditOutlined,
  PhoneOutlined,
  ShopOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Badge,
  Button,
  Card,
  Descriptions,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import { supplierService } from "../features/suppliers/supplierService";
import SupplierFormModal from "../features/suppliers/SupplierFormModal";
import { formatDateTime } from "../utils/format";

export default function SupplierDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [supplier, setSupplier] = useState(null);
  const [supplierLoading, setSupplierLoading] = useState(true);

  const [batches, setBatches] = useState([]);
  const [batchesLoading, setBatchesLoading] = useState(true);
  const [batchPagination, setBatchPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // ─── Fetch supplier detail ────────────────────────────────────────────────
  const fetchSupplier = async () => {
    setSupplierLoading(true);
    try {
      const data = await supplierService.getSupplierById(id);
      setSupplier(data);
    } catch (error) {
      message.error(error.message);
    } finally {
      setSupplierLoading(false);
    }
  };

  // ─── Fetch ingredient batches ─────────────────────────────────────────────
  const fetchBatches = async (
    page = batchPagination.current,
    pageSize = batchPagination.pageSize,
  ) => {
    setBatchesLoading(true);
    try {
      const response = await supplierService.getSupplierBatches(id, {
        page,
        limit: pageSize,
      });
      setBatches(response.data);
      setBatchPagination({
        current: response.pagination.page,
        pageSize: response.pagination.limit,
        total: response.pagination.total,
      });
    } catch (error) {
      message.error(error.message);
    } finally {
      setBatchesLoading(false);
    }
  };

  useEffect(() => {
    fetchSupplier();
    fetchBatches(1, batchPagination.pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ─── Edit supplier ────────────────────────────────────────────────────────
  const handleSubmitSupplier = async (values) => {
    setSaving(true);
    try {
      const updated = await supplierService.updateSupplier(id, values);
      setSupplier(updated);
      message.success("Supplier updated");
      setFormOpen(false);
    } catch (error) {
      message.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  // ─── Batch table columns ──────────────────────────────────────────────────
  const batchColumns = [
    {
      title: "Ingredient",
      dataIndex: "ingredientId",
      render: (ingredient) =>
        ingredient ? (
          <div>
            <div className="font-semibold text-slate-900">
              {ingredient.name}
            </div>
            <div className="text-xs text-slate-400">{ingredient.unit}</div>
          </div>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      width: 120,
      render: (qty, record) => (
        <span>
          {qty}{" "}
          <span className="text-xs text-slate-400">
            {record.ingredientId?.unit || ""}
          </span>
        </span>
      ),
    },
    {
      title: "Remaining",
      dataIndex: "remainingQuantity",
      width: 130,
      render: (remaining, record) => {
        const ratio = record.quantity > 0 ? remaining / record.quantity : 0;
        const color =
          ratio > 0.5 ? "green" : ratio > 0.2 ? "orange" : "red";
        return (
          <Tag color={color}>
            {remaining}{" "}
            <span className="opacity-70">
              {record.ingredientId?.unit || ""}
            </span>
          </Tag>
        );
      },
    },
    {
      title: "Unit Price",
      dataIndex: "unitPrice",
      width: 130,
      render: (price) =>
        price != null
          ? new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(price)
          : "—",
    },
    {
      title: "Expiry Date",
      dataIndex: "expiryDate",
      width: 150,
      render: (date) => {
        if (!date) return <span className="text-slate-400">—</span>;
        const expiry = new Date(date);
        const isExpired = expiry < new Date();
        return (
          <span className={isExpired ? "text-red-500" : "text-slate-700"}>
            {expiry.toLocaleDateString("vi-VN")}
            {isExpired && (
              <Badge
                count="Expired"
                style={{ backgroundColor: "#ef4444", marginLeft: 6 }}
              />
            )}
          </span>
        );
      },
    },
    {
      title: "Imported At",
      dataIndex: "createdAt",
      width: 165,
      render: formatDateTime,
    },
  ];

  if (supplierLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <Typography.Text type="secondary">Supplier not found.</Typography.Text>
        <Button onClick={() => navigate("/suppliers")}>Back to Suppliers</Button>
      </div>
    );
  }

  return (
    <div>
      {/* ── Page header ── */}
      <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-soft lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/suppliers")}
          >
            Back
          </Button>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-unilife-soft text-2xl text-unilife">
            <ShopOutlined />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-unilife">
              Supplier Detail
            </div>
            <Typography.Title level={3} style={{ margin: 0 }}>
              {supplier.name}
            </Typography.Title>
          </div>
        </div>
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => setFormOpen(true)}
          >
            Edit Supplier
          </Button>
        </Space>
      </div>

      {/* ── Supplier info ── */}
      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left: Info card */}
        <Card className="dashboard-card lg:col-span-2">
          <Descriptions
            title="Supplier Information"
            bordered
            column={2}
            size="middle"
          >
            <Descriptions.Item label="Supplier Name" span={2}>
              <span className="font-semibold">{supplier.name}</span>
            </Descriptions.Item>

            <Descriptions.Item label="Contact Person">
              {supplier.contactName ? (
                <span className="flex items-center gap-1.5">
                  <UserOutlined className="text-slate-400" />
                  {supplier.contactName}
                </span>
              ) : (
                <span className="text-slate-400">Not provided</span>
              )}
            </Descriptions.Item>

            <Descriptions.Item label="Phone">
              {supplier.phone ? (
                <span className="flex items-center gap-1.5 text-slate-700">
                  <PhoneOutlined className="text-slate-400" />
                  {supplier.phone}
                </span>
              ) : (
                <span className="text-slate-400">Not provided</span>
              )}
            </Descriptions.Item>

            <Descriptions.Item label="Address" span={2}>
              {supplier.address || (
                <span className="text-slate-400">Not provided</span>
              )}
            </Descriptions.Item>

            <Descriptions.Item label="Note" span={2}>
              {supplier.note || (
                <span className="text-slate-400">No notes</span>
              )}
            </Descriptions.Item>

            <Descriptions.Item label="Status">
              <Tag color={supplier.isActive ? "green" : "red"}>
                {supplier.isActive ? "Active" : "Inactive"}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Supplier ID">
              <code className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                {supplier.supplierId || supplier._id}
              </code>
            </Descriptions.Item>

            <Descriptions.Item label="Created At">
              {formatDateTime(supplier.createdAt)}
            </Descriptions.Item>

            <Descriptions.Item label="Updated At">
              {formatDateTime(supplier.updatedAt)}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Right: Summary stats */}
        <div className="flex flex-col gap-4">
          <Card className="dashboard-card flex-1">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-xl text-blue-500">
                <BoxPlotOutlined />
              </div>
              <div>
                <div className="text-sm text-slate-500">Total Batches</div>
                <div className="text-2xl font-bold text-slate-950">
                  {batchPagination.total}
                </div>
              </div>
            </div>
          </Card>

          <Card className="dashboard-card flex-1">
            <div className="text-sm text-slate-500">Total Imported (page)</div>
            <div className="mt-1 text-2xl font-bold text-unilife">
              {batches.reduce((sum, b) => sum + (b.quantity || 0), 0)}
            </div>
            <div className="text-xs text-slate-400">units across ingredients</div>
          </Card>

          <Card className="dashboard-card flex-1">
            <div className="text-sm text-slate-500">Total Value (page)</div>
            <div className="mt-1 text-xl font-bold text-green-600">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(
                batches.reduce(
                  (sum, b) => sum + (b.quantity || 0) * (b.unitPrice || 0),
                  0,
                ),
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* ── Ingredient Batches table ── */}
      <Card
        className="dashboard-card"
        title={
          <span className="flex items-center gap-2">
            <BoxPlotOutlined className="text-unilife" />
            Ingredient Batches
          </span>
        }
      >
        <Table
          rowKey="_id"
          loading={batchesLoading}
          dataSource={batches}
          columns={batchColumns}
          scroll={{ x: 800 }}
          pagination={{
            current: batchPagination.current,
            pageSize: batchPagination.pageSize,
            total: batchPagination.total,
            showSizeChanger: true,
            showTotal: (total) => `${total} batches`,
            onChange: (page, pageSize) => fetchBatches(page, pageSize),
          }}
          locale={{ emptyText: "No batches found for this supplier." }}
        />
      </Card>

      {/* ── Edit Modal ── */}
      <SupplierFormModal
        open={formOpen}
        mode="edit"
        initialValues={supplier}
        loading={saving}
        onCancel={() => setFormOpen(false)}
        onSubmit={handleSubmitSupplier}
      />
    </div>
  );
}
