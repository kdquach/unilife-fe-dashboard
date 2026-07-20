import React from "react";
import { Table } from "antd";

const formatMoney = (value = 0) =>
  new Intl.NumberFormat("vi-VN").format(value) + " ₫";

export default function RevenueTable({
  loading,
  data,
  onRowClick,
}) {
  const columns = [
    {
      title: "Period",
      dataIndex: "_id",
    },
    {
      title: "Revenue",
      dataIndex: "revenue",
      render: (value) => formatMoney(value),
    },
    {
      title: "Orders",
      dataIndex: "orders",
    },
  ];

  return (
    <Table
      style={{ marginTop: 24 }}
      rowKey="_id"
      loading={loading}
      columns={columns}
      dataSource={data}
      pagination={false}
      onRow={(record) => ({
        onClick: () => onRowClick?.(record),
        style: {
          cursor: "pointer",
        },
      })}
    />
  );
}