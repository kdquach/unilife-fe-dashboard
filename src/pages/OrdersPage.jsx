import React, { useState, useEffect } from "react";
import { Card, Space, Button, Tag } from "antd";
import { PlusOutlined, QrcodeOutlined } from "@ant-design/icons";
import PageHeader from "../components/PageHeader";
import { COLORS } from "../features/orders/utils/orderUtils.jsx";
import OrderFilters from "../features/orders/components/OrderFilters";
import OrderSummaryCards from "../features/orders/components/OrderSummaryCards";
import OrderTable from "../features/orders/components/OrderTable";
import OrderDetailDrawer from "../features/orders/components/OrderDetailDrawer";
import WalkInOrderModal from "../features/orders/components/WalkInOrderModal";
import ScanPickupQrModal from "../features/orders/components/ScanPickupQrModal";
import { useOrders } from "../features/orders/hooks/useOrders";

export default function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [keyword, setKeyword] = useState("");

  const [filters, setFilters] = useState({
    status: undefined,
    paymentStatus: undefined,
    paymentMethod: undefined,
    isWalkIn: undefined,
  });

  const { orders, loading, pagination, fetchOrders } = useOrders();

  // Initial data fetch
  useEffect(() => {
    fetchOrders(1, 10, "", filters);
  }, [filters]); // Only re-fetch when filters change

  // Realtime auto-sync
  useEffect(() => {
    let isFetching = false;
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible" && !isFetching) {
        isFetching = true;
        fetchOrders(pagination.current, pagination.pageSize, keyword, filters, true)
          .finally(() => {
            isFetching = false;
          });
      }
    }, 8000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchOrders(pagination.current, pagination.pageSize, keyword, filters, true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [pagination.current, pagination.pageSize, keyword, filters]);

  const handleSearch = (value) => {
    setKeyword(value);
    fetchOrders(1, pagination.pageSize, value, filters);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchOrders(1, pagination.pageSize, keyword, newFilters);
  };

  const handlePaginationChange = (pager) => {
    fetchOrders(pager.current, pager.pageSize, keyword, filters);
  };

  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setDetailOpen(true);
  };

  const handleScanPickup = async () => {
    setScanning(true);
    try {
      setScanOpen(true);
    } finally {
      setScanning(false);
    }
  };

  const handleScanSuccess = () => {
    fetchOrders(pagination.current, pagination.pageSize, keyword, filters);
  };

  const handleCreateSuccess = () => {
    fetchOrders(pagination.current, pagination.pageSize, keyword, filters);
  };

  const openScanModal = () => {
    setScanOpen(true);
  };

  return (
    <div>
      <PageHeader
        title={
          <Space align="center">
            <span>Order Management</span>
          </Space>
        }
        breadcrumbs={["Dashboard", "Order Management"]}
        extra={
          <Space>
            <Tag color="success" style={{ padding: "4px 10px", borderRadius: 8, fontSize: 13 }}>
              ● Live Auto-Sync
            </Tag>
            <Button
              icon={<QrcodeOutlined />}
              style={{ color: COLORS.blue, borderColor: "#adc6ff" }}
              onClick={openScanModal}
            >
              Scan Pickup QR
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateOpen(true)}
            >
              Create Walk-in Order
            </Button>
          </Space>
        }
      />

      <OrderSummaryCards orders={orders} />

      <Card
        title="Orders"
        style={{ borderRadius: 14, boxShadow: "0 2px 10px rgba(20, 20, 43, 0.05)" }}
        extra={
          <OrderFilters
            keyword={keyword}
            filters={filters}
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
          />
        }
      >
        <OrderTable
          orders={orders}
          loading={loading}
          pagination={pagination}
          onViewDetail={handleViewDetail}
          onScanPickup={handleScanPickup}
          scanning={scanning}
          onChange={handlePaginationChange}
        />
      </Card>

      <OrderDetailDrawer
        order={selectedOrder}
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setSelectedOrder(null);
        }}
        onSuccess={() => fetchOrders(pagination.current, pagination.pageSize, keyword, filters)}
      />

      <WalkInOrderModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <ScanPickupQrModal
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onSuccess={handleScanSuccess}
      />
    </div>
  );
}
