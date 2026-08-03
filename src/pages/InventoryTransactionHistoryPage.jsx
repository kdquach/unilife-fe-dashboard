import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Descriptions,
  Drawer,
  Input,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  EyeOutlined,
  HistoryOutlined,
  InboxOutlined,
  ReloadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  SyncOutlined,
  SearchOutlined,
} from "@ant-design/icons";

import PageHeader from "../components/PageHeader";
import { ingredientService } from "../features/ingredients/ingredientService";
import { ingredientTransactionService } from "../features/ingredients/ingredientTransactionService";
import { formatDate, formatDateTime } from "../utils/format";
import { COLORS } from "../features/orders/utils/orderUtils.jsx";

const { RangePicker } = DatePicker;
const { Search } = Input;

const TRANSACTION_TYPE_OPTIONS = [
  { label: "Stock Import", value: "STOCK_IMPORT" },
  { label: "Stock In", value: "STOCK_IN" },
  { label: "Stock Out", value: "STOCK_OUT" },
  { label: "Stock Adjustment", value: "STOCK_ADJUSTMENT" },
  { label: "Menu Usage", value: "MENU_USAGE" },
];

const TRANSACTION_TYPE_LABELS = {
  STOCK_IMPORT: "Stock Import",
  STOCK_IN: "Stock In",
  STOCK_OUT: "Stock Out",
  STOCK_ADJUSTMENT: "Stock Adjustment",
  MENU_USAGE: "Menu Usage",
};

const getRecordId = (record) =>
  record?._id || record?.id || record?.ingredientTransactionId;

const getUserName = (user) => {
  if (!user) return "System";
  if (typeof user === "string") return user;

  return user.fullName || user.email || user._id || "System";
};

const getIngredientName = (ingredient) => {
  if (!ingredient) return "-";
  if (typeof ingredient === "string") return ingredient;

  return ingredient.name || ingredient._id || "-";
};

const asNumber = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const getTypeColor = (type) => {
  if (type === "STOCK_IMPORT" || type === "STOCK_IN") return "green";
  if (type === "STOCK_OUT" || type === "MENU_USAGE") return "red";
  if (type === "STOCK_ADJUSTMENT") return "blue";

  return "default";
};

const getTypeLabel = (type) => TRANSACTION_TYPE_LABELS[type] || type || "TRANSACTION";

const getMetadata = (record) =>
  record?.metadata && typeof record.metadata === "object" ? record.metadata : {};

const isMenuTransaction = (record) => {
  const metadata = getMetadata(record);
  return (
    record?.transactionType === "MENU_USAGE" ||
    metadata.source === "MENU_SCHEDULE_ITEM"
  );
};

export default function InventoryTransactionHistoryPage() {
  const [transactions, setTransactions] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ingredientLoading, setIngredientLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [filters, setFilters] = useState({
    ingredientId: undefined,
    transactionType: undefined,
    dateRange: null,
  });
  const [sorter, setSorter] = useState({
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const stats = useMemo(() => {
    const stockIn = transactions.filter(
      (t) => t.transactionType === "STOCK_IMPORT" || t.transactionType === "STOCK_IN"
    ).length;
    const stockOut = transactions.filter(
      (t) => t.transactionType === "STOCK_OUT" || t.transactionType === "MENU_USAGE"
    ).length;
    const adjustments = transactions.filter(
      (t) => t.transactionType === "STOCK_ADJUSTMENT"
    ).length;
    return {
      total: transactions.length,
      stockIn,
      stockOut,
      adjustments,
    };
  }, [transactions]);

  const ingredientOptions = useMemo(
    () =>
      ingredients
        .map((ingredient) => ({
          label: ingredient.name || "Unnamed Ingredient",
          value: ingredient._id || ingredient.id,
        }))
        .filter((option) => option.value),
    [ingredients],
  );

  const fetchIngredients = async () => {
    try {
      setIngredientLoading(true);

      const response = await ingredientService.getIngredients({
        page: 1,
        limit: 100,
        sortBy: "name",
        sortOrder: "asc",
      });

      setIngredients(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setIngredients([]);
      message.warning(err.message || "Unable to load ingredients");
    } finally {
      setIngredientLoading(false);
    }
  };

  const fetchTransactions = async ({
    page = pagination.current,
    pageSize = pagination.pageSize,
    searchKeyword = keyword,
    nextFilters = filters,
    nextSorter = sorter,
  } = {}) => {
    try {
      setLoading(true);
      setError("");

      const [dateFrom, dateTo] = nextFilters.dateRange || [];
      const response =
        await ingredientTransactionService.getIngredientTransactions({
          page,
          limit: pageSize,
          keyword: searchKeyword || undefined,
          ingredientId: nextFilters.ingredientId,
          transactionType: nextFilters.transactionType,
          dateFrom: dateFrom?.startOf("day").toISOString(),
          dateTo: dateTo?.endOf("day").toISOString(),
          sortBy: nextSorter.sortBy,
          sortOrder: nextSorter.sortOrder,
        });

      setTransactions(Array.isArray(response.data) ? response.data : []);
      setPagination({
        current: response.pagination.page || page,
        pageSize: response.pagination.limit || pageSize,
        total: response.pagination.total || 0,
      });
    } catch (err) {
      setTransactions([]);
      setPagination((prev) => ({ ...prev, current: 1, total: 0 }));
      setError(err.message || "Unable to load inventory transaction history");
      message.error(err.message || "Unable to load inventory transaction history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredients();
    fetchTransactions({ page: 1, pageSize: 10 });
  }, []);

  const handleFilterChange = (key, value) => {
    const nextFilters = {
      ...filters,
      [key]: value,
    };

    setFilters(nextFilters);
    fetchTransactions({
      page: 1,
      pageSize: pagination.pageSize,
      nextFilters,
    });
  };

  const handleTableChange = (nextPagination, _filters, tableSorter) => {
    const nextSorter = {
      sortBy: tableSorter?.field || "createdAt",
      sortOrder: tableSorter?.order === "ascend" ? "asc" : "desc",
    };

    setSorter(nextSorter);
    fetchTransactions({
      page: nextPagination.current,
      pageSize: nextPagination.pageSize,
      nextSorter,
    });
  };

  const openDetail = async (record) => {
    const id = getRecordId(record);

    if (!id) {
      message.warning("Transaction ID is missing");
      return;
    }

    setSelectedTransaction(record);
    setDrawerOpen(true);

    try {
      setDetailLoading(true);
      const detail =
        await ingredientTransactionService.getIngredientTransactionById(id);
      setSelectedTransaction(detail || record);
    } catch (err) {
      message.warning(err.message || "Unable to load transaction detail");
    } finally {
      setDetailLoading(false);
    }
  };

  const resetFilters = () => {
    const nextFilters = {
      ingredientId: undefined,
      transactionType: undefined,
      dateRange: null,
    };

    setKeyword("");
    setFilters(nextFilters);
    fetchTransactions({
      page: 1,
      pageSize: pagination.pageSize,
      searchKeyword: "",
      nextFilters,
    });
  };

  const columns = [
    {
      title: "Type",
      dataIndex: "transactionType",
      width: 140,
      sorter: true,
      render: (value) => (
        <Tag color={getTypeColor(value)}>{getTypeLabel(value)}</Tag>
      ),
    },
    {
      title: "Ingredient",
      dataIndex: "ingredientId",
      width: 180,
      ellipsis: true,
      render: (value) => (
        <Typography.Text strong>{getIngredientName(value)}</Typography.Text>
      ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      width: 110,
      sorter: true,
      render: (value, record) => {
        const quantity = asNumber(value);
        const sign = quantity > 0 ? "+" : "";

        return (
          <Typography.Text type={quantity < 0 ? "danger" : "success"}>
            {sign}
            {quantity} {record.unit || record.ingredientId?.unit || ""}
          </Typography.Text>
        );
      },
    },
    {
      title: "Stock Change",
      width: 140,
      render: (_, record) => (
        <span>
          {record.stockBefore ?? "-"} {" -> "} {record.stockAfter ?? "-"}
        </span>
      ),
    },
    {
      title: "Expiry",
      dataIndex: "batchId",
      width: 110,
      render: (batch) => formatDate(batch?.expiryDate),
    },
    {
      title: "Updated By",
      dataIndex: "adjustedBy",
      width: 140,
      ellipsis: true,
      render: (value) => getUserName(value),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      width: 150,
      sorter: true,
      render: (value) => formatDateTime(value),
    },
    {
      title: "Actions",
      fixed: "right",
      width: 80,
      align: "center",
      render: (_, record) => (
        <Button
          icon={<EyeOutlined />}
          aria-label="View transaction details"
          title="View details"
          onClick={() => openDetail(record)}
        />
      ),
    },
  ];

  const detail = selectedTransaction;
  const detailMetadata = getMetadata(detail);

  return (
    <div>
      <PageHeader
        title="Inventory Transaction History"
        description="View stock imports, removals, and inventory adjustments."
        breadcrumbs={["Dashboard", "Inventory Transactions"]}
        extra={
          <Space wrap>
            <Button
              icon={<ReloadOutlined />}
              onClick={() =>
                fetchTransactions({
                  page: pagination.current,
                  pageSize: pagination.pageSize,
                  searchKeyword: keyword,
                  nextFilters: filters,
                })
              }
            >
              Refresh
            </Button>
          </Space>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card
          className="dashboard-card"
          styles={{ body: { padding: "16px 18px" } }}
          style={{
            borderRadius: 14,
            borderTop: `3px solid ${COLORS.blue}`,
            boxShadow: "0 2px 10px rgba(20, 20, 43, 0.05)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">Total Transactions</div>
              <div className="mt-1 text-2xl font-bold" style={{ color: COLORS.blue }}>
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
                background: `${COLORS.blue}1a`,
                color: COLORS.blue,
                fontSize: 18,
              }}
            >
              <HistoryOutlined />
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
              <div className="text-sm text-slate-500">Stock In</div>
              <div className="mt-1 text-2xl font-bold" style={{ color: COLORS.green }}>
                {stats.stockIn}
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
              <ArrowUpOutlined />
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
              <div className="text-sm text-slate-500">Stock Out</div>
              <div className="mt-1 text-2xl font-bold" style={{ color: COLORS.red }}>
                {stats.stockOut}
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
              <ArrowDownOutlined />
            </div>
          </div>
        </Card>

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
              <div className="text-sm text-slate-500">Adjustments</div>
              <div className="mt-1 text-2xl font-bold" style={{ color: COLORS.orange }}>
                {stats.adjustments}
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
              <SyncOutlined />
            </div>
          </div>
        </Card>
      </div>

      <Card
        title="Transaction History"
        style={{ borderRadius: 14, boxShadow: "0 2px 10px rgba(20, 20, 43, 0.05)" }}
        extra={
          <Space wrap>
            <Search
              allowClear
              enterButton={<SearchOutlined />}
              placeholder="Search reason or reference..."
              style={{ width: 280 }}
              onSearch={(value) => {
                setKeyword(value);
                fetchTransactions({
                  page: 1,
                  pageSize: pagination.pageSize,
                  searchKeyword: value,
                });
              }}
            />
            <Select
              allowClear
              showSearch
              loading={ingredientLoading}
              placeholder="Ingredient"
              style={{ width: 200 }}
              options={ingredientOptions}
              optionFilterProp="label"
              value={filters.ingredientId}
              onChange={(value) => handleFilterChange("ingredientId", value)}
            />
            <Select
              allowClear
              placeholder="Type"
              style={{ width: 170 }}
              options={TRANSACTION_TYPE_OPTIONS}
              value={filters.transactionType}
              onChange={(value) => handleFilterChange("transactionType", value)}
            />
            <RangePicker
              value={filters.dateRange}
              onChange={(value) => handleFilterChange("dateRange", value)}
              format="DD/MM/YYYY"
            />
          </Space>
        }
      >
        {error && (
          <Alert
            className="mb-4"
            type="error"
            showIcon
            message="Inventory transaction history could not be loaded"
            description={error}
          />
        )}

        <Table
          rowKey={(record) => getRecordId(record)}
          loading={loading}
          dataSource={transactions}
          columns={columns}
          locale={{
            emptyText: (
              <div className="py-8">
                <HistoryOutlined className="mb-3 text-4xl text-slate-300" />
                <div>No inventory transactions found</div>
              </div>
            ),
          }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `${total} transactions`,
          }}
          onChange={handleTableChange}
        />
      </Card>

      <Drawer
        title="Inventory Transaction Detail"
        width={560}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        loading={detailLoading}
      >
        {detail ? (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Transaction ID">
              {getRecordId(detail)}
            </Descriptions.Item>
            <Descriptions.Item label="Type">
              <Tag color={getTypeColor(detail.transactionType)}>
                {getTypeLabel(detail.transactionType)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ingredient">
              {getIngredientName(detail.ingredientId)}
            </Descriptions.Item>
            <Descriptions.Item label="Quantity">
              {detail.quantity ?? "-"}{" "}
              {detail.unit || detail.ingredientId?.unit || ""}
            </Descriptions.Item>
            <Descriptions.Item label="Stock Before">
              {detail.stockBefore ?? "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Stock After">
              {detail.stockAfter ?? "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Batch Expiry">
              {formatDate(detail.batchId?.expiryDate)}
            </Descriptions.Item>
            <Descriptions.Item label="Batch Remaining">
              {detail.batchId?.remainingQuantity ?? "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Updated By">
              {getUserName(detail.adjustedBy)}
            </Descriptions.Item>
            <Descriptions.Item label="Reason">
              {detail.reason || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Reference Type">
              {detail.referenceType || "-"}
            </Descriptions.Item>
            {isMenuTransaction(detail) && (
              <>
                <Descriptions.Item label="Food">
                  {detailMetadata.foodName || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Menu Date">
                  {detailMetadata.menuDate
                    ? formatDate(detailMetadata.menuDate)
                    : "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Serving Count">
                  {detailMetadata.servingCount ?? "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Quantity Per Serving">
                  {detailMetadata.quantityPerServing ?? "-"}{" "}
                  {detail.unit || detail.ingredientId?.unit || ""}
                </Descriptions.Item>
              </>
            )}
            <Descriptions.Item label="Created At">
              {formatDateTime(detail.createdAt)}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <div className="py-12 text-center text-slate-500">
            <InboxOutlined className="mb-3 text-4xl text-slate-300" />
            <div>No transaction selected</div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
