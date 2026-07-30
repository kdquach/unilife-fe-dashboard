import React from "react";
import { Input, Select } from "antd";

const { Search } = Input;

/**
 * Filter controls for orders table
 */
export default function OrderFilters({ 
  keyword, 
  filters, 
  onSearch, 
  onFilterChange 
}) {
  return (
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
        value={keyword}
        onSearch={onSearch}
        onChange={(e) => onSearch?.(e.target.value)}
      />

      <Select
        placeholder="Status"
        allowClear
        style={{ width: 140 }}
        value={filters.status}
        onChange={(value) => onFilterChange?.({ ...filters, status: value })}
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
        value={filters.paymentStatus}
        onChange={(value) => onFilterChange?.({ ...filters, paymentStatus: value })}
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
        value={filters.paymentMethod}
        onChange={(value) => onFilterChange?.({ ...filters, paymentMethod: value })}
        options={[
          { label: "Cash", value: "CASH" },
          { label: "SePay", value: "SEPAY" },
        ]}
      />

      <Select
        placeholder="Order Type"
        allowClear
        style={{ width: 140 }}
        value={filters.isWalkIn}
        onChange={(value) => onFilterChange?.({ ...filters, isWalkIn: value })}
        options={[
          { label: "Walk-in", value: true },
          { label: "Online", value: false },
        ]}
      />
    </div>
  );
}
