import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Form, Select, InputNumber, App, Button, Table, Space, Tag } from 'antd';
import { DeleteOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { foodService } from '../../foods/foodService';

const MenuScheduleItemCreateModal = ({ open, onCancel, onCreate, isSubmitting, existingFoodIds = [] }) => {
  const [form] = Form.useForm();
  const [foods, setFoods] = useState([]);
  const [loadingFoods, setLoadingFoods] = useState(false);
  const [selectedFoodIds, setSelectedFoodIds] = useState([]);
  const [itemsMap, setItemsMap] = useState({});
  const [defaultMaxServing, setDefaultMaxServing] = useState(50);
  const { message } = App.useApp();

  useEffect(() => {
    if (open) {
      const fetchFoods = async () => {
        setLoadingFoods(true);
        try {
          const items = await foodService.getFoods();
          setFoods(items || []);
        } catch {
          message.error('Failed to load foods list');
        } finally {
          setLoadingFoods(false);
        }
      };

      fetchFoods();
      setSelectedFoodIds([]);
      setItemsMap({});
      setDefaultMaxServing(50);
      form.resetFields();
    }
  }, [open, message, form]);

  const availableFoods = useMemo(() => {
    return foods.filter(food => food.isMenuItem && !existingFoodIds.includes(food._id));
  }, [foods, existingFoodIds]);

  const handleSelectChange = (newSelectedIds) => {
    setSelectedFoodIds(newSelectedIds);
    setItemsMap(prev => {
      const nextMap = { ...prev };
      newSelectedIds.forEach(id => {
        if (nextMap[id] === undefined) {
          nextMap[id] = defaultMaxServing || 50;
        }
      });
      Object.keys(nextMap).forEach(id => {
        if (!newSelectedIds.includes(id)) {
          delete nextMap[id];
        }
      });
      return nextMap;
    });
  };

  const handleApplyDefaultServing = () => {
    const val = defaultMaxServing || 50;
    setItemsMap(prev => {
      const nextMap = { ...prev };
      selectedFoodIds.forEach(id => {
        nextMap[id] = val;
      });
      return nextMap;
    });
    message.info(`Set default serving (${val}) for all selected food items`);
  };

  const handleItemServingChange = (foodId, value) => {
    setItemsMap(prev => ({
      ...prev,
      [foodId]: Math.max(1, parseInt(value) || 1),
    }));
  };

  const handleRemoveItem = (foodId) => {
    const nextIds = selectedFoodIds.filter(id => id !== foodId);
    handleSelectChange(nextIds);
  };

  const handleOk = () => {
    if (selectedFoodIds.length === 0) {
      message.warning('Please select at least one food item to add!');
      return;
    }

    const itemsPayload = selectedFoodIds.map(foodId => ({
      foodId,
      maxServing: itemsMap[foodId] || defaultMaxServing || 50,
    }));

    onCreate({ items: itemsPayload });
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedFoodIds([]);
    setItemsMap({});
    onCancel();
  };

  const tableColumns = [
    {
      title: 'Food Name',
      key: 'name',
      render: (_, record) => (
        <div>
          <span className="font-medium text-slate-800">{record.name}</span>
          {record.categoryName && (
            <Tag color="blue" className="ml-2 text-xs">
              {record.categoryName}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Price',
      key: 'price',
      width: 110,
      render: (_, record) => (
        <span className="text-slate-600 text-sm font-semibold">
          {record.price?.toLocaleString()}đ
        </span>
      ),
    },
    {
      title: 'Max Servings',
      key: 'maxServing',
      width: 150,
      render: (_, record) => (
        <InputNumber
          min={1}
          value={itemsMap[record._id] || 50}
          onChange={(val) => handleItemServingChange(record._id, val)}
          className="w-full"
          placeholder="Servings"
        />
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 70,
      align: 'center',
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(record._id)}
        />
      ),
    },
  ];

  const selectedFoodObjects = useMemo(() => {
    return selectedFoodIds
      .map(id => availableFoods.find(f => f._id === id))
      .filter(Boolean)
      .map(f => ({
        ...f,
        categoryName: f.categoryId?.name || f.category?.name,
      }));
  }, [selectedFoodIds, availableFoods]);

  return (
    <Modal
      title="Add Foods to Menu Schedule"
      open={open}
      onOk={handleOk}
      confirmLoading={isSubmitting}
      onCancel={handleCancel}
      okText={selectedFoodIds.length > 1 ? `Add ${selectedFoodIds.length} Foods` : 'Add Food'}
      cancelText="Cancel"
      width={700}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item label="Select Food Items (Multiple)">
          <Select
            mode="multiple"
            placeholder="Search and select one or multiple foods..."
            showSearch
            loading={loadingFoods}
            value={selectedFoodIds}
            onChange={handleSelectChange}
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={availableFoods.map(food => ({
              value: food._id,
              label: `${food.name} (${food.price?.toLocaleString()}đ)`,
            }))}
            maxTagCount="responsive"
            className="w-full"
          />
        </Form.Item>

        {selectedFoodIds.length > 0 && (
          <div className="mb-4 flex items-center justify-between rounded-lg bg-slate-50 p-3 border border-slate-200">
            <span className="text-xs font-semibold text-slate-600">
              Set Default Servings for All Selected ({selectedFoodIds.length} items):
            </span>
            <Space>
              <InputNumber
                min={1}
                value={defaultMaxServing}
                onChange={(val) => setDefaultMaxServing(val)}
                style={{ width: 100 }}
              />
              <Button
                type="dashed"
                size="small"
                icon={<ThunderboltOutlined />}
                onClick={handleApplyDefaultServing}
              >
                Apply All
              </Button>
            </Space>
          </div>
        )}

        {selectedFoodObjects.length > 0 && (
          <div>
            <div className="mb-2 text-sm font-semibold text-slate-700">
              Configured Serving Capacities
            </div>
            <Table
              dataSource={selectedFoodObjects}
              columns={tableColumns}
              rowKey="_id"
              pagination={false}
              size="small"
              bordered
              scroll={{ y: 240 }}
            />
          </div>
        )}
      </Form>
    </Modal>
  );
};

export default MenuScheduleItemCreateModal;
