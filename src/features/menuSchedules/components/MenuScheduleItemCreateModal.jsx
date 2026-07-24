import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, InputNumber, App } from 'antd';
import { foodService } from '../../foods/foodService';

const MenuScheduleItemCreateModal = ({ open, onCancel, onCreate, isSubmitting, existingFoodIds = [] }) => {
  const [form] = Form.useForm();
  const [foods, setFoods] = useState([]);
  const [loadingFoods, setLoadingFoods] = useState(false);
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
    }
  }, [open, message]);

  const handleOk = () => {
    form.validateFields()
      .then((values) => {
        onCreate(values);
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Add New Food to Schedule"
      open={open}
      onOk={handleOk}
      confirmLoading={isSubmitting}
      onCancel={handleCancel}
      okText="Add Food"
      cancelText="Cancel"
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        name="create_schedule_item_form"
        className="mt-4"
      >
        <Form.Item
          name="foodId"
          label="Select Food"
          rules={[{ required: true, message: 'Please select a food item!' }]}
        >
          <Select 
            placeholder="Search and select food" 
            showSearch 
            loading={loadingFoods}
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={foods
              .filter(food => food.isMenuItem && !existingFoodIds.includes(food._id))
              .map(food => ({
              value: food._id,
              label: food.name,
            }))}
          />
        </Form.Item>
        <Form.Item
          name="maxServing"
          label="Maximum Servings"
          rules={[{ required: true, message: 'Please enter max servings!' }]}
        >
          <InputNumber className="w-full" min={1} placeholder="E.g., 50" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MenuScheduleItemCreateModal;
