import React, { useState, useEffect } from "react";
import { Card, Button } from "antd";
import { PlusOutlined, QrcodeOutlined } from "@ant-design/icons";
import { orderService } from "../features/orders/orderService";
import PageHeader from "../components/PageHeader";
import { COLORS } from "../features/orders/utils/orderUtils.jsx";

// Components
import OrderSummaryCards from "../features/orders/components/OrderSummaryCards";
import OrderFilters from "../features/orders/components/OrderFilters";
import OrderTable from "../features/orders/components/OrderTable";
import OrderDetailDrawer from "../features/orders/components/OrderDetailDrawer";
import WalkInOrderModal from "../features/orders/components/WalkInOrderModal";
import ScanPickupQrModal from "../features/orders/components/ScanPickupQrModal";

// Hooks
import { useOrders } from "../features/orders/hooks/useOrders";
import { useTodayMenu } from "../features/orders/hooks/useTodayMenu";
import { useQrScanner } from "../features/orders/hooks/useQrScanner";

export default function OrdersPage() {
  // Local state for modals and selection
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  
  // Filter and search state
  const [keyword, setKeyword] = useState("");
  const [filters, setFilters] = useState({
    status: undefined,
    paymentStatus: undefined,
    paymentMethod: undefined,
    isWalkIn: undefined,
  });

  // Custom hooks
  const { orders, loading, scanning, pagination, fetchOrders, handleScanPickupQr, handleScanOrder } = useOrders();
  const { foods, foodsLoading, fetchTodayMenuFoods } = useTodayMenu();
  const {
    cameraActive,
    cameraLoading,
    scanDisabled,
    setCameraActive,
    setScanDisabled,
    closeScanModal,
    toggleCamera,
    resetScanner,
  } = useQrScanner({
    onScanSuccess: async (decodedText) => {
      // Handle successful QR scan
      try {
        await handleScanPickupQr({ qrPayload: decodedText });
        resetScanner();
        setScanOpen(false);
      } catch (error) {
        console.error("Scan failed:", error);
      }
    },
  });

  // Initial data fetch
  useEffect(() => {
    fetchOrders(1, 10);
  }, []);

  // Handlers
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchOrders(1, pagination.pageSize, keyword, newFilters);
  };

  const handleSearch = (value) => {
    setKeyword(value);
    fetchOrders(1, pagination.pageSize, value, filters);
  };

  const handlePaginationChange = (pager) => {
    fetchOrders(pager.current, pager.pageSize, keyword, filters);
  };

  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setDetailOpen(true);
  };

  const handleCreateWalkIn = async (payload) => {
    await orderService.createWalkInOrder(payload);
    await Promise.all([fetchOrders(), fetchTodayMenuFoods()]);
  };

  const openCreateModal = () => {
    setCreateOpen(true);
    fetchTodayMenuFoods();
  };

  const openScanModal = () => {
    setScanOpen(true);
  };

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
              style={{ color: COLORS.blue, borderColor: "#adc6ff" }}
              onClick={openScanModal}
            >
              Scan Pickup QR
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              Create Walk-in Order
            </Button>
          </>
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
  onViewDetail={(record) => {
    setSelectedOrder(record);
    setDetailOpen(true);
  }}
  onPaginationChange={(pager) =>
    fetchOrders(
      pager.current,
      pager.pageSize,
      keyword,
      filters
    )
  }
/>
      </Card>

      <OrderDetailDrawer
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        selectedOrder={selectedOrder}
      />

      <WalkInOrderModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        foods={foods}
        foodsLoading={foodsLoading}
        onCreateOrder={handleCreateWalkIn}
      />

      <ScanPickupQrModal
        open={scanOpen}
        onClose={() => {
          closeScanModal();
          setScanOpen(false);
        }}
        scanning={scanning}
        cameraActive={cameraActive}
        cameraLoading={cameraLoading}
        scanDisabled={scanDisabled}
        onToggleCamera={toggleCamera}
        onScanSubmit={handleScanPickupQr}
      />
    </div>
  );
}