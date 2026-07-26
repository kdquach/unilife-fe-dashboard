import React, { useEffect, useMemo, useRef, useState } from "react";
import { orderService } from "../features/orders/orderService";
import menuScheduleApi from "../features/menuSchedules/api/menuScheduleApi";
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
  Empty,
  Badge,
  Image,
} from "antd";
import { notify } from "../utils/notify";
import { getImageUrl, imageNotFound } from "../utils/image";
import PageHeader from "../components/PageHeader";
import {
  PlusOutlined,
  MinusOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
  EyeOutlined,
  QrcodeOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";

const formatVnd = (value) => `${Number(value || 0).toLocaleString("vi-VN")} đ`;

/**
 * Chuẩn hoá dữ liệu trả về từ GET /menu-schedules/today thành danh sách món
 * ăn có thể chọn khi tạo walk-in order.
 *
 * Response thực tế: { success, message, data: { items: [ {
 *   _id, menuScheduleItemId, foodId: { _id, name, price, imageUrl,
 *   isMenuItem, isActive, categoryId, ... },
 *   maxServing, reservedCount, servedCount, remainingCount, isActive
 * } ] } }
 *
 * `remainingCount` = maxServing - reservedCount - servedCount, là số suất
 * còn có thể bán trong ngày hôm nay -> dùng để hiển thị tồn kho và chặn
 * chọn quá số lượng cho phép.
 */
function normalizeTodayMenuItems(todayMenu) {
  if (!todayMenu) return [];

  const rawItems = todayMenu.items || [];

  return rawItems
    .filter((item) => item.isActive !== false && item.foodId)
    .map((item) => {
      const food = item.foodId || {};

      const menuScheduleItemId = item.menuScheduleItemId || item._id;

      return {
        // key dùng làm định danh duy nhất trong giỏ hàng / danh sách chọn,
        // dùng menuScheduleItemId vì đơn walk-in tạo từ thực đơn trong
        // ngày cần tham chiếu tới menuScheduleItemId khi gửi lên backend.
        key: menuScheduleItemId,
        foodId: food._id,
        menuScheduleItemId,
        name: food.name || "Unknown",
        price: food.price ?? 0,
        imageUrl: getImageUrl(food.imageUrl),
        categoryName:
          (typeof food.categoryId === "object" && food.categoryId?.name) ||
          null,
        stockQuantity: item.remainingCount,
        isMenuItem: !!food.isMenuItem,
      };
    })
    .filter((f) => f.key && f.stockQuantity > 0);
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [scanForm] = Form.useForm();
  const videoRef = useRef(null);
  const scanTimerRef = useRef(null);
  const streamRef = useRef(null);

  const [foods, setFoods] = useState([]);
  const [foodsLoading, setFoodsLoading] = useState(false);
  const [foodSearch, setFoodSearch] = useState("");

  // Giỏ hàng cho walk-in order: [{ ...food, quantity }]
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [note, setNote] = useState("");

  const [keyword, setKeyword] = useState("");

  const { Search } = Input;

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
    fetchTodayMenuFoods();
  }, []);

  useEffect(
    () => () => {
      stopCameraScan();
    },
    [],
  );

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

  // Lấy danh sách món ăn trong thực đơn hôm nay (GET /menu-schedules/today)
  // để hiển thị trong lưới chọn món khi tạo walk-in order.
  const fetchTodayMenuFoods = async () => {
    try {
      setFoodsLoading(true);

      const response = await menuScheduleApi.getTodayMenuSchedule();

      const todayMenu = response?.data ?? response;
      const normalized = normalizeTodayMenuItems(todayMenu);

      setFoods(normalized);
    } catch (error) {
      console.error(error);

      notify.error(
        "Load Today's Menu Failed",
        error?.response?.data?.message ||
          "Cannot load today's menu for walk-in order.",
      );

      setFoods([]);
    } finally {
      setFoodsLoading(false);
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

  // ---------- Cart helpers ----------

  const cartQuantityOf = (key) =>
    cart.find((item) => item.key === key)?.quantity || 0;

  const addToCart = (food) => {
    const alreadyInCart = cartQuantityOf(food.key);

    if (alreadyInCart >= food.stockQuantity) {
      notify.warning(
        "Reached Limit",
        `Chỉ còn ${food.stockQuantity} suất "${food.name}" hôm nay.`,
      );
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.key === food.key);

      if (existing) {
        return prev.map((item) =>
          item.key === food.key
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...prev, { ...food, quantity: 1 }];
    });
  };

  const updateCartQuantity = (key, quantity) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.key !== key) return item;

        const clamped = Math.max(
          1,
          Math.min(Number(quantity) || 1, item.stockQuantity),
        );

        return { ...item, quantity: clamped };
      }),
    );
  };

  const removeFromCart = (key) => {
    setCart((prev) => prev.filter((item) => item.key !== key));
  };

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  );

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  );

  const filteredFoods = useMemo(() => {
    const q = foodSearch.trim().toLowerCase();
    if (!q) return foods;
    return foods.filter((food) => food.name.toLowerCase().includes(q));
  }, [foods, foodSearch]);

  // ---------- Create walk-in modal open/close ----------

  const openCreateModal = () => {
    setCart([]);
    setPaymentMethod("CASH");
    setNote("");
    setFoodSearch("");
    setCreateOpen(true);
    fetchTodayMenuFoods();
  };

  const closeCreateModal = () => {
    setCreateOpen(false);
  };

  const handleCreateWalkIn = async () => {
    if (cart.length === 0) {
      notify.warning(
        "Empty Cart",
        "Vui lòng chọn ít nhất một món trước khi tạo đơn.",
      );
      return;
    }

    try {
      setCreating(true);

      const payload = {
        paymentMethod,
        items: cart.map((item) => ({
          menuScheduleItemId: item.menuScheduleItemId,
          itemType: "MENU_ITEM",
          quantity: item.quantity,
        })),
      };

      if (note.trim()) {
        payload.note = note.trim();
      }

      await orderService.createWalkInOrder(payload);

      notify.success(
        "Walk-in Order Created",
        "Order has been created successfully.",
      );

      closeCreateModal();

      await Promise.all([fetchOrders(), fetchTodayMenuFoods()]);
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

      stopCameraScan();
      setScanOpen(false);
      scanForm.resetFields();
      await fetchOrders();
    } catch (error) {
      notify.error("Pickup QR Scan Failed", error.message);
    } finally {
      setScanning(false);
    }
  };

  const stopCameraScan = () => {
    if (scanTimerRef.current) {
      window.clearInterval(scanTimerRef.current);
      scanTimerRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraActive(false);
    setCameraLoading(false);
  };

  const startCameraScan = async () => {
    if (!("BarcodeDetector" in window)) {
      notify.error(
        "Camera Scan Not Supported",
        "This browser does not support camera QR scanning. Paste the QR payload instead.",
      );
      return;
    }

    try {
      setCameraLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      setCameraActive(true);

      scanTimerRef.current = window.setInterval(async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) return;

        try {
          const codes = await detector.detect(videoRef.current);
          const value = codes[0]?.rawValue;
          if (!value) return;

          scanForm.setFieldsValue({ qrPayload: value });
          stopCameraScan();
          scanForm.submit();
        } catch (error) {
          // Keep scanning; transient frame decode errors are expected.
        }
      }, 600);
    } catch (error) {
      notify.error(
        "Camera Open Failed",
        error.message || "Unable to access camera.",
      );
      stopCameraScan();
    } finally {
      setCameraLoading(false);
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
      render: (value) => formatVnd(value),
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
              onClick={openCreateModal}
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
                {formatVnd(selectedOrder.totalPrice)}
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
                  render: (value) => formatVnd(value),
                },
                {
                  title: "Subtotal",
                  dataIndex: "subtotal",
                  render: (value) => formatVnd(value),
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
          stopCameraScan();
          setScanOpen(false);
          scanForm.resetFields();
        }}
        onOk={() => scanForm.submit()}
      >
        <div className="mb-4">
          <Space>
            <Button
              icon={<QrcodeOutlined />}
              loading={cameraLoading}
              onClick={cameraActive ? stopCameraScan : startCameraScan}
            >
              {cameraActive ? "Stop Camera" : "Scan with Camera"}
            </Button>
          </Space>
          {cameraActive && (
            <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-black">
              <video
                ref={videoRef}
                muted
                playsInline
                className="h-64 w-full object-cover"
              />
            </div>
          )}
        </div>

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

      {/* ---------- Create Walk-in Order (POS style) ---------- */}
      <Modal
        title="Create Walk-in Order"
        open={createOpen}
        width={960}
        onCancel={closeCreateModal}
        footer={null}
        destroyOnClose
      >
        <div className="flex flex-col gap-4 md:flex-row">
          {/* Food picker */}
          <div className="md:w-3/5">
            <Input
              allowClear
              prefix={<SearchOutlined className="text-slate-400" />}
              placeholder="Tìm món ăn hôm nay..."
              value={foodSearch}
              onChange={(e) => setFoodSearch(e.target.value)}
              className="mb-3"
            />

            <div
              className="grid grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3"
              style={{ maxHeight: "58vh" }}
            >
              {foodsLoading && (
                <div className="col-span-full py-10 text-center text-slate-400">
                  Đang tải thực đơn hôm nay...
                </div>
              )}

              {!foodsLoading && filteredFoods.length === 0 && (
                <div className="col-span-full py-10">
                  <Empty description="Không có món nào trong thực đơn hôm nay" />
                </div>
              )}

              {!foodsLoading &&
                filteredFoods.map((food) => {
                  const inCartQty = cartQuantityOf(food.key);
                  const remaining = food.stockQuantity - inCartQty;
                  const soldOut = remaining <= 0;

                  return (
                    <div
                      key={food.key}
                      onClick={() => !soldOut && addToCart(food)}
                      className={`group relative flex flex-col overflow-hidden rounded-lg border transition ${
                        soldOut
                          ? "cursor-not-allowed border-slate-100 opacity-60"
                          : "cursor-pointer border-slate-200 hover:border-blue-400 hover:shadow-md"
                      }`}
                    >
                      <div className="relative h-24 w-full bg-slate-100">
                        <Image
                          src={food.imageUrl}
                          fallback={imageNotFound}
                          alt={food.name}
                          width="100%"
                          height={96}
                          className="object-cover"
                          style={{ objectFit: "cover" }}
                          preview={false}
                        />

                        {inCartQty > 0 && (
                          <Badge
                            count={inCartQty}
                            style={{
                              position: "absolute",
                              top: 6,
                              right: 6,
                              backgroundColor: "#1677ff",
                            }}
                          />
                        )}
                      </div>

                      <div className="flex flex-1 flex-col p-2">
                        <div
                          className="text-sm font-medium text-slate-800"
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={food.name}
                        >
                          {food.name}
                        </div>

                        <div className="text-xs font-semibold text-blue-600">
                          {formatVnd(food.price)}
                        </div>

                        <div className="mt-auto flex items-center justify-between pt-2">
                          <Tag
                            color={soldOut ? "red" : "green"}
                            style={{ margin: 0 }}
                          >
                            {soldOut ? "Hết suất" : `Còn ${remaining}`}
                          </Tag>

                          <Button
                            size="small"
                            type="primary"
                            shape="circle"
                            icon={<PlusOutlined />}
                            disabled={soldOut}
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(food);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Cart */}
          <div className="flex flex-col md:w-2/5 md:border-l md:pl-4">
            <div className="mb-2 flex items-center gap-2 font-semibold text-slate-700">
              <ShoppingCartOutlined />
              Giỏ hàng ({cartCount})
            </div>

            <div
              className="flex flex-col gap-2 overflow-y-auto pr-1"
              style={{ maxHeight: "34vh", minHeight: 80 }}
            >
              {cart.length === 0 && (
                <div className="py-6 text-center text-sm text-slate-400">
                  Chưa chọn món nào. Bấm vào món bên trái để thêm.
                </div>
              )}

              {cart.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center gap-2 rounded-md border border-slate-100 p-2"
                >
                  <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-slate-100">
                    <Image
                      src={item.imageUrl}
                      fallback={imageNotFound}
                      alt={item.name}
                      width={40}
                      height={40}
                      style={{ objectFit: "cover" }}
                      preview={false}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div
                      className="truncate text-sm font-medium"
                      title={item.name}
                    >
                      {item.name}
                    </div>
                    <div className="text-xs text-slate-400">
                      {formatVnd(item.price)}
                    </div>
                  </div>

                  <Space.Compact size="small">
                    <Button
                      icon={<MinusOutlined />}
                      onClick={() =>
                        updateCartQuantity(item.key, item.quantity - 1)
                      }
                    />
                    <InputNumber
                      size="small"
                      min={1}
                      max={item.stockQuantity}
                      value={item.quantity}
                      onChange={(v) => updateCartQuantity(item.key, v || 1)}
                      style={{ width: 48, textAlign: "center" }}
                      controls={false}
                    />
                    <Button
                      icon={<PlusOutlined />}
                      disabled={item.quantity >= item.stockQuantity}
                      onClick={() =>
                        updateCartQuantity(item.key, item.quantity + 1)
                      }
                    />
                  </Space.Compact>

                  <div
                    className="text-right text-sm font-semibold"
                    style={{ width: 84 }}
                  >
                    {formatVnd(item.price * item.quantity)}
                  </div>

                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => removeFromCart(item.key)}
                  />
                </div>
              ))}
            </div>

            <div className="mt-3 border-t border-slate-100 pt-3">
              <div className="mb-3 flex items-center justify-between text-base">
                <span className="font-medium text-slate-600">
                  Tổng cộng
                </span>
                <span className="text-lg font-bold text-blue-600">
                  {formatVnd(cartTotal)}
                </span>
              </div>

              <div className="mb-2">
                <div className="mb-1 text-xs text-slate-500">
                  Phương thức thanh toán
                </div>
                <Select
                  value={paymentMethod}
                  onChange={setPaymentMethod}
                  style={{ width: "100%" }}
                  options={[
                    { label: "Cash", value: "CASH" },
                    { label: "SePay", value: "SEPAY" },
                  ]}
                />
              </div>

              <div className="mb-3">
                <div className="mb-1 text-xs text-slate-500">
                  Ghi chú (tuỳ chọn)
                </div>
                <Input.TextArea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: khách yêu cầu ít cay..."
                />
              </div>

              <Button
                type="primary"
                block
                size="large"
                loading={creating}
                disabled={cart.length === 0}
                onClick={handleCreateWalkIn}
              >
                Tạo đơn ({cartCount} món · {formatVnd(cartTotal)})
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}