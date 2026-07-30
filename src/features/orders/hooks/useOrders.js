import { useState } from "react";
import { orderService } from "../orderService";
import { notify } from "../../../utils/notify";

/**
 * Hook to manage orders list, fetching, and QR scanning
 */
export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchOrders = async (
    page = pagination.current,
    limit = pagination.pageSize,
    searchKeyword = "",
    currentFilters = {},
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

  const handleScanPickupQr = async (values) => {
    try {
      setScanning(true);

      const qrPayload = typeof values.qrPayload === "string" ? values.qrPayload.trim() : values.qrPayload;

      let payload;
      if (values.orderCode) {
        // Manual input with orderCode field
        payload = { orderCode: values.orderCode };
      } else {
        // Try to parse the scanned payload to determine if it's an order code or JSON
        try {
          const parsed = JSON.parse(qrPayload);
          // Only treat as JSON if it's an object (not a number or string)
          if (typeof parsed === "object" && parsed !== null) {
            payload = { qrPayload };
          } else if (/^\d+$/.test(qrPayload)) {
            payload = { orderCode: qrPayload };
          } else {
            payload = { qrPayload };
          }
        } catch {
          // Not JSON: check if it's a numeric order code
          if (/^\d+$/.test(qrPayload)) {
            payload = { orderCode: qrPayload };
          } else {
            payload = { qrPayload };
          }
        }
      }

      const result = await orderService.scanPickupQr(payload);

      notify.success(
        result.created ? "Pickup QR Scanned" : "Pickup QR Already Scanned",
        `Queue #${result.queue?.queueNumber || "-"} is ready for kitchen.`,
      );

      await fetchOrders();

      return result;
    } catch (error) {
      console.error("Scan error:", error);
      notify.error("Pickup QR Scan Failed", error.message);
      throw error;
    } finally {
      setScanning(false);
    }
  };

  const handleScanOrder = async (order) => {
    await handleScanPickupQr({ orderCode: order.orderCode });
  };

  return {
    orders,
    loading,
    scanning,
    pagination,
    fetchOrders,
    handleScanPickupQr,
    handleScanOrder,
  };
}
