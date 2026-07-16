import React from 'react';
import { Modal, Form, DatePicker } from 'antd';
import dayjs from 'dayjs';

const MenuScheduleCreateModal = ({ open, onCancel, onCreate, isSubmitting }) => {
  const [form] = Form.useForm();

  const handleOk = () => {
    form.validateFields()
      .then((values) => {
        // Format date string explicitly to bypass timezone shift issues in toISOString
        const formattedDate = values.date.format('YYYY-MM-DD[T00:00:00.000Z]');
        onCreate({ date: formattedDate });
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  // Disable past dates
  const disabledDate = (current) => {
    return current && current < dayjs().startOf('day');
  };

  return (
    <Modal
      title="Create New Menu Schedule"
      open={open}
      onOk={handleOk}
      confirmLoading={isSubmitting}
      onCancel={handleCancel}
      okText="Create"
      cancelText="Cancel"
    >
      <Form
        form={form}
        layout="vertical"
        name="create_menu_schedule_form"
      >
        <Form.Item
          name="date"
          label="Serving Date"
          rules={[{ required: true, message: 'Please select a date!' }]}
        >
          <DatePicker className="w-full" disabledDate={disabledDate} format="DD/MM/YYYY" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MenuScheduleCreateModal;
