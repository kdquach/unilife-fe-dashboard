import React, { useEffect } from 'react';
import { Modal, Form, DatePicker, Select } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const { Option } = Select;
const { confirm } = Modal;

const MenuScheduleUpdateModal = ({ open, onCancel, onUpdate, isSubmitting, initialData, totalReservedCount }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && initialData) {
      form.setFieldsValue({
        date: dayjs(initialData.date).tz('Asia/Ho_Chi_Minh'),
        status: initialData.status,
      });
    }
  }, [open, initialData, form]);

  const hasReserved = totalReservedCount > 0;

  const handleOk = () => {
    form.validateFields()
      .then((values) => {
        const formattedDate = values.date.format('YYYY-MM-DD[T00:00:00.000Z]');
        const initialDateFormatted = dayjs(initialData.date).tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD[T00:00:00.000Z]');
        const payload = {
          status: values.status,
        };

        if (formattedDate !== initialDateFormatted) {
          payload.date = formattedDate;
        }

        if (values.status === 'CANCELLED') {
          confirm({
            title: 'Are you sure you want to CANCEL this schedule?',
            icon: <ExclamationCircleFilled />,
            content: 'This action is irreversible. All reserved items will be refunded automatically.',
            okText: 'Yes, Cancel it',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
              onUpdate(payload);
            },
          });
        } else {
          onUpdate(payload);
        }
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const disabledDate = (current) => {
    return current && current < dayjs().startOf('day');
  };

  return (
    <Modal
      title="Update Menu Schedule"
      open={open}
      onOk={handleOk}
      confirmLoading={isSubmitting}
      onCancel={handleCancel}
      okText="Update"
      cancelText="Cancel"
    >
      <Form
        form={form}
        layout="vertical"
        name="update_menu_schedule_form"
      >
        <Form.Item
          name="date"
          label="Serving Date"
          rules={[{ required: true, message: 'Please select a date!' }]}
          extra={hasReserved ? "Cannot change date because customers have already placed orders." : ""}
        >
          <DatePicker 
            className="w-full" 
            disabledDate={disabledDate} 
            format="DD/MM/YYYY" 
            disabled={hasReserved}
          />
        </Form.Item>
        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: 'Please select a status!' }]}
        >
          <Select>
            {!hasReserved && <Option value="DRAFT">Draft</Option>}
            <Option value="PUBLISHED">Published</Option>
            <Option value="COMPLETED">Completed</Option>
            <Option value="CANCELLED">Cancelled</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MenuScheduleUpdateModal;
