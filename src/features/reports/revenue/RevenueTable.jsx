import React from "react";
import { Button, Table } from "antd";
import { EyeOutlined } from "@ant-design/icons";

const formatMoney = (value = 0) =>
  new Intl.NumberFormat("vi-VN").format(value) + " ₫";

export default function RevenueTable({
  loading,
  data,
  onView,
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
    {
      title: "Actions",
      width: 80,
      align: "center",
      render: (_, record) => (
        <Button
          icon={<EyeOutlined />}
          aria-label={`View revenue for ${record._id}`}
          title="View details"
          onClick={() => onView?.(record)}
        />
      ),
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
    />
  );
}
