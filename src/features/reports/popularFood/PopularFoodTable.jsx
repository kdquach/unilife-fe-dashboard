import React from "react";
import { Table } from "antd";

const formatMoney = (value = 0) =>
  new Intl.NumberFormat("vi-VN").format(value) + " ₫";

export default function PopularFoodTable({
  loading = false,
  data = [],
  onRowClick,
}) {
  const columns = [
    {
      title: "Food Name",
      dataIndex: "foodName",
      key: "foodName",
    },
    {
      title: "Total Sold",
      dataIndex: "totalSold",
      key: "totalSold",
      align: "center",
      sorter: (a, b) => a.totalSold - b.totalSold,
    },
    {
      title: "Revenue",
      dataIndex: "revenue",
      key: "revenue",
      align: "right",
      sorter: (a, b) => a.revenue - b.revenue,
      render: (value) => formatMoney(value),
    },
  ];

  return (
    <Table
      style={{
        marginTop: 24,
      }}
      rowKey="_id"
      loading={loading}
      columns={columns}
      dataSource={data}
      pagination={false}
      onRow={(record) => ({
        onClick: () => {
          if (onRowClick) {
            onRowClick(record);
          }
        },
        style: {
          cursor: onRowClick ? "pointer" : "default",
        },
      })}
    />
  );
}