import React, { useEffect, useMemo, useState } from "react";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  FieldTimeOutlined,
  PhoneOutlined,
  ReloadOutlined,
  SearchOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Empty,
  Input,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import PageHeader from "../components/PageHeader";
import { queueService } from "../features/queues/queueService";
import { notify } from "../utils/notify";
import { formatDateTime } from "../utils/format";

const { Search } = Input;

const queueStatusColors = {
  WAITING: "gold",
  SERVING: "blue",
  DONE: "green",
  SKIPPED: "red",
};

const orderStatusColors = {
  PENDING_PAYMENT: "orange",
  PAID: "green",
  CONFIRMED: "blue",
  READY_FOR_PICKUP: "cyan",
  COMPLETED: "green",
  CANCELLED: "red",
  EXPIRED: "red",
};

const formatCurrency = (value) =>
  `${Number(value || 0).toLocaleString("vi-VN")} VND`;

const renderTag = (value, colors) => (
  <Tag color={colors[value] || "default"}>{value || "-"}</Tag>
);

const getOrder = (queue) => queue?.orderId || {};

const getItemName = (item) =>
  item?.foodId?.name || item?.menuScheduleItemId?.foodId?.name || "Unknown";

const renderItems = (items = []) => (
  <Space direction="vertical" size={2}>
    {items.length > 0 ? (
      items.map((item) => (
        <span key={item._id || item.orderItemId}>
          {getItemName(item)} x{item.quantity}
        </span>
      ))
    ) : (
      <span>-</span>
    )}
  </Space>
);

export default function KitchenQueuePage() {
  const [currentServing, setCurrentServing] = useState(null);
  const [waitingQueues, setWaitingQueues] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(false);
  const [callingNext, setCallingNext] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [filters, setFilters] = useState({
    isWalkIn: undefined,
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchMonitorQueue = async (
    page = pagination.current,
    limit = pagination.pageSize,
    searchKeyword = keyword,
    currentFilters = filters,
  ) => {
    try {
      setLoading(true);

      const response = await queueService.getMonitorQueue({
        page,
        limit,
        keyword: searchKeyword || undefined,
        ...currentFilters,
      });

      setCurrentServing(response.currentServing || null);
      setWaitingQueues(response.waiting || []);
      setSummary(response.summary || {});
      setPagination({
        current: response.pagination.page,
        pageSize: response.pagination.limit,
        total: response.pagination.total,
      });
    } catch (error) {
      notify.error("Queue Load Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitorQueue(1, 10);
  }, []);

  const handleCallNextNumber = async () => {
    try {
      setCallingNext(true);

      const result = await queueService.callNextNumber();

      notify.success(
        "Order Completed",
        result.currentServing
          ? `Queue #${result.currentServing.queueNumber} is now serving.`
          : "No waiting queue remains.",
      );

      await fetchMonitorQueue(
        pagination.current,
        pagination.pageSize,
        keyword,
        filters,
      );
    } catch (error) {
      notify.error("Call Next Failed", error.message);
    } finally {
      setCallingNext(false);
    }
  };

  const statusCards = useMemo(
    () => [
      {
        title: "Today's Queue",
        value: summary.total || 0,
        color: "text-slate-900",
        icon: <ShopOutlined />,
      },
      {
        title: "Serving",
        value: summary.serving || 0,
        color: "text-blue-600",
        icon: <FieldTimeOutlined />,
      },
      {
        title: "Waiting",
        value: summary.waiting || 0,
        color: "text-orange-500",
        icon: <ClockCircleOutlined />,
      },
      {
        title: "Done",
        value: summary.done || 0,
        color: "text-green-600",
        icon: <CheckCircleOutlined />,
      },
    ],
    [summary],
  );

  const waitingColumns = [
    {
      title: "Queue No.",
      dataIndex: "queueNumber",
      width: 120,
      render: (value) => (
        <Typography.Text strong className="text-lg">
          #{value}
        </Typography.Text>
      ),
    },
    {
      title: "Order",
      render: (_, record) => {
        const order = getOrder(record);
        return (
          <div>
            <div className="font-semibold text-slate-900">
              {order.orderCode || "-"}
            </div>
            <div className="text-xs text-slate-500">
              {order.isWalkIn ? "Walk-in" : "Online"}
            </div>
          </div>
        );
      },
    },
    {
      title: "Items",
      render: (_, record) => renderItems(getOrder(record).items || []),
    },
    {
      title: "Customer",
      render: (_, record) => {
        const order = getOrder(record);
        return order.userId?.fullName || <Tag color="blue">Walk-in</Tag>;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (value) => renderTag(value, queueStatusColors),
    },
    {
      title: "Scanned At",
      dataIndex: "scannedAt",
      render: formatDateTime,
    },
  ];

  const servingOrder = getOrder(currentServing);

  return (
    <div>
      <PageHeader
        title="Kitchen Queue"
        description="Serve scanned orders in kitchen order. Paid orders only appear here after Counter Staff scans the QR."
        breadcrumbs={["Dashboard", "Kitchen Queue"]}
        extra={
          <>
            <Button
              type="primary"
              icon={<PhoneOutlined />}
              onClick={handleCallNextNumber}
              loading={callingNext}
              disabled={!currentServing}
            >
              Call Next
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => fetchMonitorQueue()}
              loading={loading}
            >
              Refresh
            </Button>
          </>
        }
      />

      <Row gutter={[16, 16]} className="mb-6">
        {statusCards.map((item) => (
          <Col xs={24} md={12} xl={6} key={item.title}>
            <Card className="dashboard-card">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm text-slate-500">{item.title}</div>
                  <div className={`mt-1 text-2xl font-bold ${item.color}`}>
                    {item.value}
                  </div>
                </div>
                <div className="text-2xl text-slate-300">{item.icon}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="mb-6" title="Current Serving">
        {currentServing ? (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[260px_1fr_240px]">
            <div className="flex min-h-40 flex-col items-center justify-center rounded-lg border border-blue-100 bg-blue-50">
              <div className="text-sm font-medium uppercase text-blue-500">
                Queue Number
              </div>
              <div className="mt-2 text-6xl font-bold text-blue-700">
                #{currentServing.queueNumber}
              </div>
              <div className="mt-3">
                {renderTag(currentServing.status, queueStatusColors)}
              </div>
            </div>

            <div>
              <Typography.Title level={4} className="!mb-1">
                {servingOrder.orderCode}
              </Typography.Title>
              <Typography.Text className="text-slate-500">
                {servingOrder.userId?.fullName ||
                  (servingOrder.isWalkIn ? "Walk-in customer" : "Customer")}
              </Typography.Text>

              <div className="mt-5">
                <Typography.Text strong>Items</Typography.Text>
                <div className="mt-2">{renderItems(servingOrder.items || [])}</div>
              </div>

              {servingOrder.note && (
                <div className="mt-5 rounded-lg bg-slate-50 p-3">
                  <Typography.Text strong>Note</Typography.Text>
                  <div className="mt-1 text-slate-600">{servingOrder.note}</div>
                </div>
              )}
            </div>

            <Space direction="vertical" size={10}>
              <div>
                <div className="text-xs uppercase text-slate-400">Scanned</div>
                <div className="font-medium">
                  {formatDateTime(currentServing.scannedAt)}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase text-slate-400">Serving</div>
                <div className="font-medium">
                  {formatDateTime(currentServing.servedAt)}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase text-slate-400">Total</div>
                <div className="font-medium">
                  {formatCurrency(servingOrder.totalPrice)}
                </div>
              </div>
              <div>{renderTag(servingOrder.status, orderStatusColors)}</div>
            </Space>
          </div>
        ) : (
          <Empty description="No serving order right now" />
        )}
      </Card>

      <Card
        title="Waiting Queue"
        extra={
          <div className="flex flex-wrap items-center gap-3">
            <Search
              placeholder="Search order code..."
              allowClear
              enterButton={<SearchOutlined />}
              style={{ width: 260 }}
              onSearch={(value) => {
                setKeyword(value);
                fetchMonitorQueue(1, pagination.pageSize, value);
              }}
            />

            <Select
              placeholder="Order Type"
              allowClear
              style={{ width: 140 }}
              onChange={(value) => {
                const nextFilters = { ...filters, isWalkIn: value };
                setFilters(nextFilters);
                fetchMonitorQueue(1, pagination.pageSize, keyword, nextFilters);
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
          columns={waitingColumns}
          dataSource={waitingQueues}
          scroll={{ x: 900 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `${total} waiting orders`,
          }}
          onChange={(pager) => {
            fetchMonitorQueue(pager.current, pager.pageSize, keyword, filters);
          }}
        />
      </Card>
    </div>
  );
}
