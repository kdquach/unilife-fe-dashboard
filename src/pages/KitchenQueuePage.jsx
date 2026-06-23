import React, { useEffect, useMemo, useState } from "react";
import {
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
  CALLED: "blue",
  PREPARING: "purple",
  READY: "cyan",
  COMPLETED: "green",
  CANCELLED: "red",
};

const orderStatusColors = {
  PENDING: "orange",
  CONFIRMED: "blue",
  PREPARING: "purple",
  READY: "cyan",
  COMPLETED: "green",
  CANCELLED: "red",
};

const formatCurrency = (value) =>
  `${Number(value || 0).toLocaleString("vi-VN")} VND`;

const renderTag = (value, colors) => (
  <Tag color={colors[value] || "default"}>{value || "-"}</Tag>
);

const getOrder = (queue) => queue?.orderId || {};

const getItemName = (item) =>
  item?.foodId?.name || item?.menuScheduleItemId?.foodId?.name || "Unknown";

export default function KitchenQueuePage() {
  const [queues, setQueues] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(false);
  const [callingNext, setCallingNext] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [filters, setFilters] = useState({
    status: undefined,
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

      setQueues(response.data);
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

      const calledQueue = await queueService.callNextNumber();

      notify.success(
        "Queue Number Called",
        `Queue #${calledQueue.queueNumber} is now called.`,
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
        title: "Active Queue",
        value: summary.total || 0,
        color: "text-slate-900",
        icon: <ShopOutlined />,
      },
      {
        title: "Waiting",
        value: summary.waiting || 0,
        color: "text-orange-500",
        icon: <ClockCircleOutlined />,
      },
      {
        title: "Called",
        value: summary.called || 0,
        color: "text-blue-600",
        icon: <FieldTimeOutlined />,
      },
      {
        title: "Preparing",
        value: summary.preparing || 0,
        color: "text-purple-600",
        icon: <FieldTimeOutlined />,
      },
    ],
    [summary],
  );

  const columns = [
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
      render: (_, record) => {
        const items = getOrder(record).items || [];
        return (
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
      },
    },
    {
      title: "Customer",
      render: (_, record) => {
        const order = getOrder(record);
        return order.userId?.fullName || <Tag color="blue">Walk-in</Tag>;
      },
    },
    {
      title: "Queue Status",
      dataIndex: "status",
      render: (value) => renderTag(value, queueStatusColors),
    },
    {
      title: "Order Status",
      render: (_, record) => renderTag(getOrder(record).status, orderStatusColors),
    },
    {
      title: "Total",
      render: (_, record) => formatCurrency(getOrder(record).totalPrice),
    },
    {
      title: "Called At",
      dataIndex: "calledAt",
      render: formatDateTime,
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      render: formatDateTime,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Kitchen Queue"
        description="Monitor paid orders waiting for kitchen preparation."
        breadcrumbs={["Dashboard", "Kitchen Queue"]}
        extra={
          <>
            <Button
              type="primary"
              icon={<PhoneOutlined />}
              onClick={handleCallNextNumber}
              loading={callingNext}
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

      <Card
        title="Monitor Queue"
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
              placeholder="Queue Status"
              allowClear
              style={{ width: 160 }}
              onChange={(value) => {
                const nextFilters = { ...filters, status: value };
                setFilters(nextFilters);
                fetchMonitorQueue(1, pagination.pageSize, keyword, nextFilters);
              }}
              options={[
                { label: "Waiting", value: "WAITING" },
                { label: "Called", value: "CALLED" },
                { label: "Preparing", value: "PREPARING" },
                { label: "Ready", value: "READY" },
              ]}
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
          columns={columns}
          dataSource={queues}
          scroll={{ x: 1100 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `${total} queue entries`,
          }}
          onChange={(pager) => {
            fetchMonitorQueue(pager.current, pager.pageSize, keyword, filters);
          }}
        />
      </Card>
    </div>
  );
}
