import React from 'react';
import { Table, Tag, Button } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { formatDate, formatDateTime } from '../../../utils/format';

const MenuScheduleTable = ({ data, loading, pagination, onChange, onViewDetail }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'PUBLISHED':
        return 'green';
      case 'DRAFT':
        return 'gold';
      case 'CANCELLED':
        return 'red';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text) => <span className="font-medium text-gray-800">{formatDate(text)}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)} className="px-2 py-0.5 rounded font-medium">
          {status}
        </Tag>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => <span className="text-gray-500">{formatDateTime(text)}</span>,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="text" 
          icon={<EyeOutlined className="text-blue-500" />} 
          onClick={() => onViewDetail(record._id)}
          className="hover:bg-blue-50 transition-colors"
        >
          <span className="text-blue-500">Details</span>
        </Button>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <Table
        columns={columns}
        dataSource={data}
        rowKey="_id"
        pagination={{
          current: pagination.page,
          pageSize: pagination.limit,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
          className: 'px-4'
        }}
        loading={loading}
        onChange={onChange}
        className="w-full"
      />
    </div>
  );
};

export default MenuScheduleTable;
