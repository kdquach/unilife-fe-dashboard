import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Form, InputNumber, App, Button, Space, Tag, Image, Badge, Empty } from 'antd';
import { PlusOutlined, MinusOutlined, DeleteOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { foodService } from '../../foods/foodService';
import { getImageUrl, imageNotFound } from '../../../utils/image';

const formatVnd = (value) => `${Number(value || 0).toLocaleString("vi-VN")} đ`;

const MenuScheduleItemCreateModal = ({ open, onCancel, onCreate, isSubmitting, existingFoodIds = [] }) => {
  const [form] = Form.useForm();
  const [foods, setFoods] = useState([]);
  const [loadingFoods, setLoadingFoods] = useState(false);
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [defaultMaxServing, setDefaultMaxServing] = useState(50);
  const { message } = App.useApp();

  useEffect(() => {
    if (open) {
      const fetchFoods = async () => {
        setLoadingFoods(true);
        try {
          const response = await foodService.getManagedFoods({
            page: 1,
            limit: 1000,
            isMenuItem: true,
          });
          setFoods(response.data || []);
        } catch {
          message.error('Failed to load foods list');
        } finally {
          setLoadingFoods(false);
        }
      };

      fetchFoods();
      setSelectedFoods([]);
      setDefaultMaxServing(50);
      form.resetFields();
    }
  }, [open, message, form]);

  const availableFoods = useMemo(() => {
    return foods.filter(food => food.isMenuItem && !existingFoodIds.includes(food._id));
  }, [foods, existingFoodIds]);

  const addToSelected = (food) => {
    if (selectedFoods.find(f => f.foodId === food._id)) return;
    
    setSelectedFoods(prev => [...prev, {
      foodId: food._id,
      name: food.name,
      price: food.price,
      imageUrl: food.imageUrl,
      categoryName: food.categoryId?.name || food.category?.name,
      maxServing: defaultMaxServing || 50,
    }]);
  };

  const removeFromSelected = (foodId) => {
    setSelectedFoods(prev => prev.filter(f => f.foodId !== foodId));
  };

  const updateServing = (foodId, value) => {
    setSelectedFoods(prev => prev.map(f => 
      f.foodId === foodId ? { ...f, maxServing: Math.max(1, parseInt(value) || 1) } : f
    ));
  };

  const handleOk = () => {
    if (selectedFoods.length === 0) {
      message.warning('Please select at least one food item to add!');
      return;
    }

    const itemsPayload = selectedFoods.map(item => ({
      foodId: item.foodId,
      maxServing: item.maxServing,
    }));

    onCreate({ items: itemsPayload });
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedFoods([]);
    onCancel();
  };

  return (
    <Modal
      title="Add Foods to Menu Schedule"
      open={open}
      onOk={handleOk}
      confirmLoading={isSubmitting}
      onCancel={handleCancel}
      okText={selectedFoods.length > 1 ? `Add ${selectedFoods.length} Foods` : 'Add Food'}
      cancelText="Cancel"
      width={1000}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" className="mt-4">
        <div className="flex gap-4" style={{ minHeight: '500px' }}>
          {/* Available Foods */}
          <div className="flex-1">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-700">
                Available Menu Items ({availableFoods.length})
              </div>
              <Space>
                <InputNumber
                  min={1}
                  value={defaultMaxServing}
                  onChange={(val) => setDefaultMaxServing(val)}
                  style={{ width: 100 }}
                  placeholder="Default"
                />
                <Button
                  type="dashed"
                  size="small"
                  icon={<ThunderboltOutlined />}
                  onClick={() => message.info('Default serving will be applied to newly added items')}
                >
                  Default
                </Button>
              </Space>
            </div>
            
            <div className="grid grid-cols-2 gap-3" style={{ maxHeight: '450px', overflowY: 'auto' }}>
              {availableFoods.map((food) => {
                const isSelected = selectedFoods.find(f => f.foodId === food._id);
                
                return (
                  <div
                    key={food._id}
                    className={`relative flex flex-col overflow-hidden rounded-lg border transition ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 opacity-50'
                        : 'border-slate-200 hover:border-blue-400 hover:shadow-md'
                    }`}
                  >
                    <div className="relative h-24 w-full bg-slate-100">
                      <Image
                        src={getImageUrl(food.imageUrl)}
                        fallback={imageNotFound}
                        alt={food.name}
                        width="100%"
                        height={96}
                        className="object-cover"
                        style={{ objectFit: "cover" }}
                        preview={false}
                      />
                      {isSelected && (
                        <Badge
                          count="✓"
                          style={{
                            position: "absolute",
                            top: 6,
                            right: 6,
                            backgroundColor: "#1677ff",
                          }}
                        />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-2">
                      <div className="mb-1 text-xs font-medium text-slate-500 line-clamp-1">
                        {food.categoryId?.name || food.category?.name}
                      </div>
                      <div className="mb-1 text-sm font-semibold text-slate-800 line-clamp-2">
                        {food.name}
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="text-sm font-bold text-blue-600">
                          {formatVnd(food.price)}
                        </div>
                        <Button
                          size="small"
                          type="primary"
                          shape="circle"
                          icon={<PlusOutlined />}
                          disabled={isSelected}
                          onClick={() => addToSelected(food)}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {availableFoods.length === 0 && (
                <div className="col-span-2 py-8">
                  <Empty description="No available menu items" />
                </div>
              )}
            </div>
          </div>

          {/* Selected Foods */}
          <div className="w-80 flex flex-col border-l pl-4">
            <div className="mb-3 text-sm font-semibold text-slate-700">
              Selected Items ({selectedFoods.length})
            </div>
            
            <div className="flex-1 overflow-y-auto" style={{ maxHeight: '450px' }}>
              {selectedFoods.length === 0 ? (
                <div className="flex h-full items-center justify-center text-slate-400">
                  No items selected
                </div>
              ) : (
                selectedFoods.map((item) => (
                  <div
                    key={item.foodId}
                    className="mb-2 flex items-center gap-2 rounded border p-2"
                  >
                    <Image
                      src={getImageUrl(item.imageUrl)}
                      fallback={imageNotFound}
                      alt={item.name}
                      width={48}
                      height={48}
                      className="rounded object-cover"
                      preview={false}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800 truncate">
                        {item.name}
                      </div>
                      <div className="text-xs text-blue-600">
                        {formatVnd(item.price)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <InputNumber
                        min={1}
                        size="small"
                        value={item.maxServing}
                        onChange={(val) => updateServing(item.foodId, val)}
                        style={{ width: 70 }}
                      />
                      <Button
                        size="small"
                        danger
                        type="text"
                        icon={<DeleteOutlined />}
                        onClick={() => removeFromSelected(item.foodId)}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </Form>
    </Modal>
  );
};

export default MenuScheduleItemCreateModal;
