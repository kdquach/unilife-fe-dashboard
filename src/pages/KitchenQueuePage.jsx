import React, { useState, useEffect, useMemo } from "react";
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
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  FieldTimeOutlined,
  PhoneOutlined,
  SearchOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import PageHeader from "../components/PageHeader";
import { COLORS } from "../features/orders/utils/orderUtils.jsx";
import { formatDateTime } from "../utils/format";

// Hooks
import { useKitchenQueue } from "../features/kitchen/hooks/useKitchenQueue";

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
  // Local state for filters and search
  const [keyword, setKeyword] = useState("");
  const [filters, setFilters] = useState({
    isWalkIn: undefined,
  });

  // Custom hook
  const {
    currentServing,
    waitingQueues,
    summary,
    loading,
    callingNext,
    pagination,
    fetchMonitorQueue,
    callNextQueue,
  } = useKitchenQueue();

  // Initial data fetch and realtime auto-sync
  useEffect(() => {
    fetchMonitorQueue(1, 10, "", filters);

    let isFetching = false;
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible" && !isFetching) {
        isFetching = true;
        fetchMonitorQueue(pagination.current, pagination.pageSize, keyword, filters, true)
          .finally(() => {
            isFetching = false;
          });
      }
    }, 5000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchMonitorQueue(pagination.current, pagination.pageSize, keyword, filters, true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [pagination.current, pagination.pageSize, keyword, filters]);

  const handleFilterChange = (key, value) => {
    const nextFilters = { ...filters, [key]: value };
    setFilters(nextFilters);
    fetchMonitorQueue(1, pagination.pageSize, keyword, nextFilters);
  };

  const handleSearch = (value) => {
    setKeyword(value);
    fetchMonitorQueue(1, pagination.pageSize, value, filters);
  };

  const handlePaginationChange = (page, pageSize) => {
    fetchMonitorQueue(page, pageSize, keyword, filters);
  };

  const handleCallNextNumber = async () => {
    await callNextQueue();
  };

  const statusCards = useMemo(
    () => [
      {
        title: "Today's Queue",
        value: summary.total || 0,
        color: COLORS.orange,
        borderColor: COLORS.orange,
        icon: <ShopOutlined />,
      },
      {
        title: "Serving",
        value: summary.serving || 0,
        color: COLORS.blue,
        borderColor: COLORS.blue,
        icon: <FieldTimeOutlined />,
      },
      {
        title: "Waiting",
        value: summary.waiting || 0,
        color: COLORS.orange,
        borderColor: COLORS.orange,
        icon: <ClockCircleOutlined />,
      },
      {
        title: "Done",
        value: summary.done || 0,
        color: COLORS.green,
        borderColor: COLORS.green,
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
        breadcrumbs={["Dashboard", "Kitchen Queue"]}
        extra={
          <>
            <Tag color="success" style={{ padding: "4px 10px", borderRadius: 8, fontSize: 13 }}>
              ● Live Auto-Sync
            </Tag>
            <Button
              type="primary"
              icon={<PhoneOutlined />}
              onClick={handleCallNextNumber}
              loading={callingNext}
              disabled={!currentServing}
            >
              Call Next
            </Button>
          </>
        }
      />

        <Row gutter={[16, 16]} className="mb-6">
          {statusCards.map((item) => (
            <Col xs={24} md={12} xl={6} key={item.title}>
              <Card
                className="dashboard-card"
                styles={{ body: { padding: "16px 18px" } }}
                style={{
                  borderRadius: 14,
                  borderTop: `3px solid ${item.borderColor}`,
                  boxShadow: "0 2px 10px rgba(20, 20, 43, 0.05)",
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-500">{item.title}</div>
                    <div className="mt-1 text-2xl font-bold" style={{ color: item.color }}>
                      {item.value}
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
                      background: `${item.color}1a`,
                      color: item.color,
                      fontSize: 18,
                    }}
                  >
                    {item.icon}
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        <Card
          className="mb-6"
          title="Current Serving"
          style={{ borderRadius: 14, boxShadow: "0 2px 10px rgba(20, 20, 43, 0.05)" }}
        >
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
          style={{ borderRadius: 14, boxShadow: "0 2px 10px rgba(20, 20, 43, 0.05)" }}
          extra={
            <Space wrap>
              <Search
                placeholder="Search order code..."
                allowClear
                enterButton={<SearchOutlined />}
                style={{ width: 280 }}
                onSearch={handleSearch}
              />

              <Select
                placeholder="Order Type"
                allowClear
                style={{ width: 140 }}
                onChange={(value) => handleFilterChange("isWalkIn", value)}
                options={[
                  { label: "Walk-in", value: true },
                  { label: "Online", value: false },
                ]}
              />
            </Space>
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
            onChange={handlePaginationChange}
          />
        </Card>
      </div>
  );
}
