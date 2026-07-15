import React from 'react';
import { Table, Rate, Tag, Typography, Avatar, Space, Tooltip } from 'antd';
import { UserOutlined, MessageOutlined, FileTextOutlined } from '@ant-design/icons';
import { formatDate } from '../../../utils/format';

const { Text, Paragraph } = Typography;

const RatingsTable = ({ data, loading, pagination, onChange }) => {
  const columns = [
    {
      title: 'Customer',
      dataIndex: 'userId',
      key: 'userId',
      width: 250,
      render: (user) => (
        <Space>
          <Avatar src={user?.avatar} icon={<UserOutlined />} />
          <div className="flex flex-col">
            <Text strong>{user?.fullName || 'Unknown User'}</Text>
            <Text type="secondary" className="text-xs">{user?.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Target',
      key: 'target',
      width: 200,
      render: (_, record) => {
        if (record.ratingType === 'FOOD') {
          return (
            <div className="flex flex-col">
              <Tag color="orange">FOOD</Tag>
              <Text className="mt-1 font-medium">{record.foodId?.name}</Text>
            </div>
          );
        }
        if (record.ratingType === 'ORDER') {
          return (
            <div className="flex flex-col">
              <Tag color="blue">ORDER</Tag>
              <Text className="mt-1 font-medium">{record.orderId?.orderCode}</Text>
            </div>
          );
        }
        return <Tag>{record.ratingType}</Tag>;
      },
    },
    {
      title: 'Rating',
      key: 'rating',
      width: 400,
      render: (_, record) => (
        <div className="flex flex-col">
          <Rate disabled defaultValue={record.stars} className="text-sm" />
          {record.comment && (
            <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: 'more' }} className="mt-2 mb-0 text-slate-600">
              &quot;{record.comment}&quot;
            </Paragraph>
          )}
        </div>
      ),
    },
    {
      title: 'Reply Status',
      key: 'replyStatus',
      width: 150,
      render: (_, record) => {
        if (record.staffReply) {
          return (
            <Tooltip title={record.staffReply}>
              <Tag color="success" icon={<MessageOutlined />}>Replied</Tag>
            </Tooltip>
          );
        }
        return <Tag color="default">Pending Reply</Tag>;
      },
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date) => <Text className="text-slate-500 whitespace-nowrap">{formatDate(date)}</Text>,
    },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: () => (
        <Space>
          <Tooltip title="View Detail">
            <Typography.Link className="flex items-center justify-center w-8 h-8 rounded hover:bg-slate-100">
              <FileTextOutlined className="text-lg text-blue-600" />
            </Typography.Link>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
      <Table
        columns={columns}
        dataSource={data}
        rowKey="_id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} ratings`,
        }}
        onChange={onChange}
        scroll={{ x: 1000 }}
      />
    </div>
  );
};

export default RatingsTable;
