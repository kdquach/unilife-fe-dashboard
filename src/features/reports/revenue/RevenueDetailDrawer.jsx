import React from "react";
import {
  Drawer,
  Descriptions,
  Tag,
  Statistic,
  Row,
  Col,
} from "antd";
import {
  DollarOutlined,
  ShoppingCartOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

const formatMoney = (value = 0) =>
  new Intl.NumberFormat("vi-VN").format(value) + " ₫";

export default function RevenueDetailDrawer({
  open,
  data,
  onClose,
}) {
  return (
    <Drawer
      title="Revenue Details"
      placement="right"
      width={520}
      open={open}
      onClose={onClose}
      destroyOnHidden
    >
      {!data ? null : (
        <>

          <Descriptions
            bordered
            column={1}
            size="middle"
          >
            <Descriptions.Item label="Period">
              <Tag
                color="blue"
                icon={<CalendarOutlined />}
              >
                {data._id}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Revenue">
              {formatMoney(data.revenue)}
            </Descriptions.Item>

            <Descriptions.Item label="Orders">
              {data.orders}
            </Descriptions.Item>

            <Descriptions.Item label="Average Revenue / Order">
  {data.orders > 0
    ? formatMoney(
        Math.round(data.revenue / data.orders)
      )
    : formatMoney(0)}
</Descriptions.Item>
          </Descriptions>
        </>
      )}
    </Drawer>
  );
}
