import React, { useEffect, useState } from "react";
import { orderService } from "../features/orders/orderService";
import { foodService } from "../features/foods/foodService";
import {
  Card,
  Table,
  Tag,
  Modal,
  Descriptions,
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  message,
} from "antd";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form] = Form.useForm();

  const [foods, setFoods] = useState([]);

  const [orderItems, setOrderItems] = useState([
    {
      foodId: null,
      quantity: 1,
    },
  ]);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchOrders(1, 10);
    fetchFoods();
  }, []);

  const fetchOrders = async (
    page = pagination.current,
    limit = pagination.pageSize,
  ) => {
    try {
      setLoading(true);

      const response = await orderService.getOrders({
        page,
        limit,
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

  const fetchFoods = async () => {
    try {
      const data = await foodService.getFoods();

      console.log("FOODS =", data);

      setFoods(data);
    } catch (error) {
      console.error(error);
    }
  };

  const renderOrderStatus = (status) => {
    const colors = {
      PENDING: "orange",
      PAID: "blue",
      PREPARING: "purple",
      READY: "cyan",
      COMPLETED: "green",
      CANCELLED: "red",
    };

    return <Tag color={colors[status] || "default"}>{status}</Tag>;
  };

  const renderPaymentStatus = (status) => {
    const colors = {
      PENDING: "orange",
      PAID: "green",
      FAILED: "red",
      REFUND_PENDING: "gold",
      REFUNDED: "blue",
    };

    return <Tag color={colors[status] || "default"}>{status}</Tag>;
  };

  const handleCreateWalkIn = async (values) => {
    try {
      setCreating(true);

      const payload = {
        paymentMethod: values.paymentMethod,
        items: values.items.map((item) => ({
          foodId: item.foodId,
          itemType: "REGULAR_FOOD",
          quantity: item.quantity,
        })),
      };

      await orderService.createWalkInOrder(payload);

      message.success("Walk-in order created successfully");

      setCreateOpen(false);
      form.resetFields();

      await Promise.all([fetchOrders(), fetchFoods()]);
    } catch (error) {
      console.error(error);

      message.error(
        error?.response?.data?.message || "Create walk-in order failed",
      );
    } finally {
      setCreating(false);
    }
  };

  const columns = [
    {
      title: "Order Code",
      dataIndex: "orderCode",
    },
    {
      title: "Customer",
      dataIndex: "userId",
      render: (user) => user?.fullName || <Tag color="blue">Walk-in</Tag>,
    },
    {
      title: "Queue",
      dataIndex: "queue",
      render: (queue) => queue?.queueNumber,
    },
    {
      title: "Items",
      dataIndex: "items",
      render: (items = []) =>
        items
          .map(
            (item) =>
              item?.foodId?.name ||
              item?.menuScheduleItemId?.foodId?.name ||
              "Unknown",
          )
          .join(", "),
    },
    {
      title: "Total",
      dataIndex: "totalPrice",
      render: (value) => `${Number(value || 0).toLocaleString("vi-VN")} đ`,
    },
    {
      title: "Order Status",
      dataIndex: "status",
      render: renderOrderStatus,
    },
    {
      title: "Payment",
      dataIndex: "paymentStatus",
      render: renderPaymentStatus,
    },
    {
      title: "Method",
      dataIndex: "paymentMethod",
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      render: (value) => new Date(value).toLocaleString("vi-VN"),
    },
  ];

  return (
    <>
      <Card
        title="Orders"
        extra={
          <Button
            type="primary"
            onClick={() => {
              form.setFieldsValue({
                paymentMethod: "CASH",
                items: [{ quantity: 1 }],
              });

              setCreateOpen(true);
            }}
          >
            Create Walk-in Order
          </Button>
        }
      >
        <Table
          rowKey="_id"
          loading={loading}
          columns={columns}
          dataSource={orders}
          pagination={pagination}
          onChange={(pager) => {
            fetchOrders(pager.current, pager.pageSize);
          }}
          onRow={(record) => ({
            onClick: () => {
              setSelectedOrder(record);
              setDetailOpen(true);
            },
          })}
        />
      </Card>

      <Modal
        title={`Order ${selectedOrder?.orderCode}`}
        open={detailOpen}
        footer={null}
        onCancel={() => setDetailOpen(false)}
        width={900}
      >
        {selectedOrder && (
          <>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Order Code">
                {selectedOrder.orderCode}
              </Descriptions.Item>

              <Descriptions.Item label="Customer">
                {selectedOrder.userId?.fullName || "Walk-in"}
              </Descriptions.Item>

              <Descriptions.Item label="Status">
                {selectedOrder.status}
              </Descriptions.Item>

              <Descriptions.Item label="Payment Status">
                {selectedOrder.paymentStatus}
              </Descriptions.Item>

              <Descriptions.Item label="Payment Method">
                {selectedOrder.paymentMethod}
              </Descriptions.Item>

              <Descriptions.Item label="Total Price">
                {selectedOrder.totalPrice?.toLocaleString("vi-VN")} đ
              </Descriptions.Item>
            </Descriptions>

            <Table
              style={{ marginTop: 20 }}
              pagination={false}
              rowKey="_id"
              dataSource={selectedOrder.items || []}
              columns={[
                {
                  title: "Food",
                  render: (_, item) =>
                    item.foodId?.name ||
                    item.menuScheduleItemId?.foodId?.name ||
                    "Unknown",
                },
                {
                  title: "Quantity",
                  dataIndex: "quantity",
                },
                {
                  title: "Unit Price",
                  dataIndex: "unitPrice",
                  render: (value) =>
                    Number(value).toLocaleString("vi-VN") + " đ",
                },
                {
                  title: "Subtotal",
                  dataIndex: "subtotal",
                  render: (value) =>
                    Number(value).toLocaleString("vi-VN") + " đ",
                },
              ]}
            />
          </>
        )}
      </Modal>

      <Modal
        title="Create Walk-in Order"
        open={createOpen}
        confirmLoading={creating}
        onCancel={() => {
          setCreateOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateWalkIn}>
          <Form.List name="items" initialValue={[{ quantity: 1 }]}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name }) => (
                  <div
                    key={key}
                    style={{
                      display: "flex",
                      gap: 10,
                      marginBottom: 10,
                    }}
                  >
                    <Form.Item
                      name={[name, "foodId"]}
                      style={{ flex: 1 }}
                      rules={[
                        {
                          required: true,
                          message: "Select food",
                        },
                      ]}
                    >
                      <Select
                        placeholder="Select food"
                        showSearch
                        optionFilterProp="label"
                        options={foods.map((food) => ({
                          value: food._id,
                          label: `${food.name} - ${food.price.toLocaleString(
                            "vi-VN",
                          )} đ ${
                            food.isMenuItem
                              ? "(Menu Item)"
                              : `(Stock: ${food.stockQuantity})`
                          }`,
                        }))}
                      />
                    </Form.Item>

                    <Form.Item name={[name, "quantity"]} initialValue={1}>
                      <InputNumber min={1} />
                    </Form.Item>

                    <Button danger onClick={() => remove(name)}>
                      Remove
                    </Button>
                  </div>
                ))}

                <Button
                  type="dashed"
                  block
                  onClick={() =>
                    add({
                      quantity: 1,
                    })
                  }
                >
                  + Add Food
                </Button>
              </>
            )}
          </Form.List>

          <Form.Item
            label="Payment Method"
            name="paymentMethod"
            initialValue="CASH"
          >
            <Select
              options={[
                {
                  label: "Cash",
                  value: "CASH",
                },
                {
                  label: "SePay",
                  value: "SEPAY",
                },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
