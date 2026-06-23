import React, { useEffect, useState } from "react";
import { orderService } from "../features/orders/orderService";
import { foodService } from "../features/foods/foodService";
import {
  Card,
  Table,
  Tag,
  Modal,
  Descriptions,
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Drawer,
  Space,
} from "antd";
import { notify } from "../utils/notify";
import PageHeader from "../components/PageHeader";
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  EyeOutlined,
  QrcodeOutlined,
} from "@ant-design/icons";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [form] = Form.useForm();
  const [scanForm] = Form.useForm();

  const [foods, setFoods] = useState([]);

  const [keyword, setKeyword] = useState("");

  const { Search } = Input;

  const [orderItems, setOrderItems] = useState([
    {
      foodId: null,
      quantity: 1,
    },
  ]);

  const [filters, setFilters] = useState({
    status: undefined,
    paymentStatus: undefined,
    paymentMethod: undefined,
    isWalkIn: undefined,
  });

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchOrders(1, 10);
    fetchFoods();
  }, []);

  const fetchOrders = async (
    page = pagination.current,
    limit = pagination.pageSize,
    searchKeyword = keyword,
    currentFilters = filters,
  ) => {
    try {
      setLoading(true);

      const response = await orderService.getOrders({
        page,
        limit,
        keyword: searchKeyword,
        ...currentFilters,
      });

      setOrders(response.data);

      setPagination({
        current: response.pagination.page,
        pageSize: response.pagination.limit,
        total: response.pagination.total,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFoods = async () => {
    try {
      const data = await foodService.getFoods();

      console.log("FOODS =", data);

      setFoods(data);
    } catch (error) {
      console.error(error);
    }
  };

  const renderOrderStatus = (status) => {
    const colors = {
      PENDING_PAYMENT: "orange",
      PENDING: "orange",
      PAID: "green",
      CONFIRMED: "blue",
      PREPARING: "purple",
      READY: "cyan",
      READY_FOR_PICKUP: "cyan",
      COMPLETED: "green",
      CANCELLED: "red",
      EXPIRED: "red",
    };

    return <Tag color={colors[status] || "default"}>{status}</Tag>;
  };

  const renderPaymentStatus = (status) => {
    const colors = {
      PENDING: "orange",
      PAID: "green",
      FAILED: "red",
      REFUND_PENDING: "gold",
      REFUNDED: "blue",
    };

    return <Tag color={colors[status] || "default"}>{status}</Tag>;
  };

  const handleCreateWalkIn = async (values) => {
    try {
      setCreating(true);

      const payload = {
        paymentMethod: values.paymentMethod,
        items: values.items.map((item) => ({
          foodId: item.foodId,
          itemType: "REGULAR_FOOD",
          quantity: item.quantity,
        })),
      };

      await orderService.createWalkInOrder(payload);

      notify.success(
        "Walk-in Order Created",
        "Order has been created successfully.",
      );

      setCreateOpen(false);
      form.resetFields();

      await Promise.all([fetchOrders(), fetchFoods()]);
    } catch (error) {
      console.error(error);

      notify.error(
        "Order Creation Failed",
        error?.response?.data?.message || "Unexpected error occurred.",
      );
    } finally {
      setCreating(false);
    }
  };

  const handleScanPickupQr = async (values) => {
    try {
      setScanning(true);

      const qrPayload = values.qrPayload?.trim();
      const payload = values.orderCode
        ? { orderCode: values.orderCode }
        : { qrPayload };

      const result = await orderService.scanPickupQr(payload);

      notify.success(
        result.created ? "Pickup QR Scanned" : "Pickup QR Already Scanned",
        `Queue #${result.queue?.queueNumber || "-"} is ready for kitchen.`,
      );

      setScanOpen(false);
      scanForm.resetFields();
      await fetchOrders();
    } catch (error) {
      notify.error("Pickup QR Scan Failed", error.message);
    } finally {
      setScanning(false);
    }
  };

  const handleScanOrder = async (order) => {
    await handleScanPickupQr({ orderCode: order.orderCode });
  };

  const canScanPickup = (order) =>
    order?.paymentStatus === "PAID" &&
    ["PAID", "CONFIRMED"].includes(order?.status) &&
    !order?.queue;

  const columns = [
    {
      title: "Order Code",
      dataIndex: "orderCode",
    },
    {
      title: "Customer",
      dataIndex: "userId",
      render: (user) => user?.fullName || <Tag color="blue">Walk-in</Tag>,
    },
    {
      title: "Queue",
      dataIndex: "queue",
      render: (queue) => queue?.queueNumber,
    },
    {
      title: "Items",
      dataIndex: "items",
      render: (items = []) =>
        items
          .map(
            (item) =>
              item?.foodId?.name ||
              item?.menuScheduleItemId?.foodId?.name ||
              "Unknown",
          )
          .join(", "),
    },
    {
      title: "Total",
      dataIndex: "totalPrice",
      render: (value) => `${Number(value || 0).toLocaleString("vi-VN")} đ`,
    },
    {
      title: "Order Status",
      dataIndex: "status",
      render: renderOrderStatus,
    },
    {
      title: "Payment",
      dataIndex: "paymentStatus",
      render: renderPaymentStatus,
    },
    {
      title: "Method",
      dataIndex: "paymentMethod",
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      render: (value) => new Date(value).toLocaleString("vi-VN"),
    },
    {
      title: "Actions",
      fixed: "right",
      width: 130,
      render: (_, record) => (
        <Space size={6}>
          <Button
            icon={<EyeOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedOrder(record);
              setDetailOpen(true);
            }}
          />
          <Button
            icon={<QrcodeOutlined />}
            disabled={!canScanPickup(record)}
            loading={scanning}
            onClick={(e) => {
              e.stopPropagation();
              handleScanOrder(record);
            }}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Order Management"
        description="Manage customer orders, payment status and walk-in orders."
        breadcrumbs={["Dashboard", "Order Management"]}
        extra={
          <>
            <Button
              icon={<QrcodeOutlined />}
              onClick={() => setScanOpen(true)}
            >
              Scan Pickup QR
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                form.setFieldsValue({
                  paymentMethod: "CASH",
                  items: [{ quantity: 1 }],
                });

                setCreateOpen(true);
              }}
            >
              Create Walk-in Order
            </Button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="dashboard-card">
          <div className="text-sm text-slate-500">Orders On Page</div>

          <div className="mt-1 text-2xl font-bold">{orders.length}</div>
        </Card>

        <Card className="dashboard-card">
          <div className="text-sm text-slate-500">Completed</div>

          <div className="mt-1 text-2xl font-bold text-green-600">
            {orders.filter((o) => o.status === "COMPLETED").length}
          </div>
        </Card>

        <Card className="dashboard-card">
          <div className="text-sm text-slate-500">Pending</div>

          <div className="mt-1 text-2xl font-bold text-orange-500">
            {orders.filter((o) => o.status === "PENDING").length}
          </div>
        </Card>

        <Card className="dashboard-card">
          <div className="text-sm text-slate-500">Cancelled</div>

          <div className="mt-1 text-2xl font-bold text-red-500">
            {orders.filter((o) => o.status === "CANCELLED").length}
          </div>
        </Card>
      </div>

      <Card
        title="Orders"
        extra={
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <Search
              placeholder="Search order code..."
              allowClear
              style={{ width: 250 }}
              onSearch={(value) => {
                setKeyword(value);
                fetchOrders(1, pagination.pageSize, value);
              }}
            />

            <Select
              placeholder="Status"
              allowClear
              style={{ width: 140 }}
              onChange={(value) => {
                const newFilters = {
                  ...filters,
                  status: value,
                };

                setFilters(newFilters);
                fetchOrders(1, pagination.pageSize, keyword, newFilters);
              }}
              options={[
                { label: "Pending Payment", value: "PENDING_PAYMENT" },
                { label: "Paid", value: "PAID" },
                { label: "Confirmed", value: "CONFIRMED" },
                { label: "Ready for Pickup", value: "READY_FOR_PICKUP" },
                { label: "Completed", value: "COMPLETED" },
                { label: "Cancelled", value: "CANCELLED" },
                { label: "Expired", value: "EXPIRED" },
              ]}
            />

            <Select
              placeholder="Payment"
              allowClear
              style={{ width: 150 }}
              onChange={(value) => {
                const newFilters = {
                  ...filters,
                  paymentStatus: value,
                };

                setFilters(newFilters);
                fetchOrders(1, pagination.pageSize, keyword, newFilters);
              }}
              options={[
                { label: "Pending", value: "PENDING" },
                { label: "Paid", value: "PAID" },
                { label: "Failed", value: "FAILED" },
                { label: "Refunded", value: "REFUNDED" },
              ]}
            />

            <Select
              placeholder="Method"
              allowClear
              style={{ width: 130 }}
              onChange={(value) => {
                const newFilters = {
                  ...filters,
                  paymentMethod: value,
                };

                setFilters(newFilters);
                fetchOrders(1, pagination.pageSize, keyword, newFilters);
              }}
              options={[
                { label: "Cash", value: "CASH" },
                { label: "SePay", value: "SEPAY" },
              ]}
            />

            <Select
              placeholder="Order Type"
              allowClear
              style={{ width: 140 }}
              onChange={(value) => {
                const newFilters = {
                  ...filters,
                  isWalkIn: value,
                };

                setFilters(newFilters);
                fetchOrders(1, pagination.pageSize, keyword, newFilters);
              }}
              options={[
                { label: "Walk-in", value: true },
                { label: "Online", value: false },
              ]}
            />

          </div>
        }
      >
        <Table
          rowKey="_id"
          loading={loading}
          columns={columns}
          dataSource={orders}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `${total} orders`,
          }}
          onChange={(pager) => {
            fetchOrders(pager.current, pager.pageSize, keyword, filters);
          }}
        />
      </Card>

      <Drawer
        title={`Order ${selectedOrder?.orderCode}`}
        placement="right"
        width={900}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      >
        {selectedOrder && (
          <>
            {/* Customer Information */}
            <Descriptions
              bordered
              column={2}
              title="Customer Information"
              style={{ marginBottom: 20 }}
            >
              <Descriptions.Item label="Full Name">
                {selectedOrder.userId?.fullName || "Walk-in"}
              </Descriptions.Item>

              <Descriptions.Item label="User ID">
                {selectedOrder.userId?.userId || "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Email">
                {selectedOrder.userId?.email || "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Phone">
                {selectedOrder.userId?.phone || "-"}
              </Descriptions.Item>
            </Descriptions>

            {/* Order Information */}
            <Descriptions
              bordered
              column={2}
              title="Order Information"
              style={{ marginBottom: 20 }}
            >
              <Descriptions.Item label="Order Code">
                {selectedOrder.orderCode}
              </Descriptions.Item>

              <Descriptions.Item label="Order ID">
                {selectedOrder.orderId}
              </Descriptions.Item>

              <Descriptions.Item label="Status">
                {renderOrderStatus(selectedOrder.status)}
              </Descriptions.Item>

              <Descriptions.Item label="Payment Status">
                {renderPaymentStatus(selectedOrder.paymentStatus)}
              </Descriptions.Item>

              <Descriptions.Item label="Payment Method">
                {selectedOrder.paymentMethod}
              </Descriptions.Item>

              <Descriptions.Item label="Order Type">
                {selectedOrder.isWalkIn ? "Walk-in" : "Online"}
              </Descriptions.Item>

              <Descriptions.Item label="Total Price">
                {selectedOrder.totalPrice?.toLocaleString("vi-VN")} đ
              </Descriptions.Item>

              <Descriptions.Item label="Transaction Ref">
                {selectedOrder.transactionRef || "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Created At">
                {new Date(selectedOrder.createdAt).toLocaleString("vi-VN")}
              </Descriptions.Item>

              <Descriptions.Item label="Updated At">
                {new Date(selectedOrder.updatedAt).toLocaleString("vi-VN")}
              </Descriptions.Item>

              <Descriptions.Item label="Note" span={2}>
                {selectedOrder.note || "-"}
              </Descriptions.Item>
            </Descriptions>

            <Table
              style={{ marginTop: 20 }}
              pagination={false}
              rowKey="_id"
              dataSource={selectedOrder.items || []}
              columns={[
                {
                  title: "Food",
                  render: (_, item) =>
                    item.foodId?.name ||
                    item.menuScheduleItemId?.foodId?.name ||
                    "Unknown",
                },
                {
                  title: "Quantity",
                  dataIndex: "quantity",
                },
                {
                  title: "Unit Price",
                  dataIndex: "unitPrice",
                  render: (value) =>
                    Number(value).toLocaleString("vi-VN") + " đ",
                },
                {
                  title: "Subtotal",
                  dataIndex: "subtotal",
                  render: (value) =>
                    Number(value).toLocaleString("vi-VN") + " đ",
                },
              ]}
            />

            {/* Queue Information */}
            <Descriptions
              bordered
              column={2}
              title="Queue Information"
              style={{ marginBottom: 20 }}
            >
              <Descriptions.Item label="Queue Number">
                {selectedOrder.queue?.queueNumber || "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Queue Status">
                {selectedOrder.queue?.status || "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Called At">
                {selectedOrder.queue?.servedAt
                  ? new Date(selectedOrder.queue.servedAt).toLocaleString(
                      "vi-VN",
                    )
                  : "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Completed At">
                {selectedOrder.queue?.doneAt
                  ? new Date(selectedOrder.queue.doneAt).toLocaleString(
                      "vi-VN",
                    )
                  : "-"}
              </Descriptions.Item>
            </Descriptions>

            
          </>
        )}
      </Drawer>

      <Modal
        title="Scan Pickup QR"
        open={scanOpen}
        confirmLoading={scanning}
        onCancel={() => {
          setScanOpen(false);
          scanForm.resetFields();
        }}
        onOk={() => scanForm.submit()}
      >
        <Form form={scanForm} layout="vertical" onFinish={handleScanPickupQr}>
          <Form.Item
            label="QR payload or order code"
            name="qrPayload"
            rules={[
              {
                required: true,
                message: "Scan or enter a pickup QR payload.",
              },
            ]}
          >
            <Input.TextArea
              autoFocus
              rows={4}
              placeholder='Scan QR here, paste JSON/URL, or enter order code like "478969"'
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Create Walk-in Order"
        open={createOpen}
        confirmLoading={creating}
        onCancel={() => {
          setCreateOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateWalkIn}>
          <Form.List name="items" initialValue={[{ quantity: 1 }]}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name }) => (
                  <div
                    key={key}
                    style={{
                      display: "flex",
                      gap: 10,
                      marginBottom: 10,
                    }}
                  >
                    <Form.Item
                      name={[name, "foodId"]}
                      style={{ flex: 1 }}
                      rules={[
                        {
                          required: true,
                          message: "Select food",
                        },
                      ]}
                    >
                      <Select
                        placeholder="Select food"
                        showSearch
                        optionFilterProp="label"
                        options={foods.map((food) => ({
                          value: food._id,
                          label: `${food.name} - ${food.price.toLocaleString(
                            "vi-VN",
                          )} đ ${
                            food.isMenuItem
                              ? "(Menu Item)"
                              : `(Stock: ${food.stockQuantity})`
                          }`,
                        }))}
                      />
                    </Form.Item>

                    <Form.Item name={[name, "quantity"]} initialValue={1}>
                      <InputNumber min={1} />
                    </Form.Item>

                    <Button danger onClick={() => remove(name)}>
                      Remove
                    </Button>
                  </div>
                ))}

                <Button
                  type="dashed"
                  block
                  onClick={() =>
                    add({
                      quantity: 1,
                    })
                  }
                >
                  + Add Food
                </Button>
              </>
            )}
          </Form.List>

          <Form.Item
            label="Payment Method"
            name="paymentMethod"
            initialValue="CASH"
          >
            <Select
              options={[
                {
                  label: "Cash",
                  value: "CASH",
                },
                {
                  label: "SePay",
                  value: "SEPAY",
                },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
