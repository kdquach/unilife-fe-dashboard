import React, { useState, useEffect } from "react";
import { Card, Space, Button } from "antd";
import { PlusOutlined, QrcodeOutlined } from "@ant-design/icons";
import PageHeader from "../components/PageHeader";
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

  useEffect(() => {
    fetchOrders(1, 10);
  }, []);

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

  const handleScanPickup = async (order) => {
    setScanning(true);
    try {
      // This will be handled by the ScanPickupQrModal
      // For now, just open the modal
      setScanOpen(true);
    } finally {
      setScanning(false);
    }
  };

  const handleScanSuccess = () => {
    fetchOrders();
  };

  const handleCreateSuccess = () => {
    fetchOrders();
  };

  return (
    <div>
      <PageHeader
        title="Order Management"
        description="Manage customer orders, payment status and walk-in orders."
        breadcrumbs={["Dashboard", "Order Management"]}
        extra={
          <Space>
            <Button
              icon={<QrcodeOutlined />}
              onClick={() => setScanOpen(true)}
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
        onClose={() => setDetailOpen(false)}
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
