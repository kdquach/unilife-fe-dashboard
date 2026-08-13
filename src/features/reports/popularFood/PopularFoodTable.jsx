import React from "react";
import { Button, Table } from "antd";
import { EyeOutlined } from "@ant-design/icons";

const formatMoney = (value = 0) =>
  new Intl.NumberFormat("vi-VN").format(value) + " ₫";

export default function PopularFoodTable({
  loading = false,
  data = [],
  onView,
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
    {
      title: "Actions",
      width: 80,
      align: "center",
      render: (_, record) => (
        <Button
          icon={<EyeOutlined />}
          aria-label={`View ${record.foodName}`}
          title="View details"
          onClick={() => onView?.(record)}
        />
      ),
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
    />
  );
}
