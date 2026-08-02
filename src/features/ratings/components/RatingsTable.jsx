import React from 'react';
import { Table, Rate, Tag, Typography, Avatar, Space, Tooltip } from 'antd';
import { UserOutlined, MessageOutlined, FileTextOutlined } from '@ant-design/icons';
import { formatDate } from '../../../utils/format';

const { Text, Paragraph } = Typography;

const RatingsTable = ({ data, loading, pagination, onChange, onViewDetail }) => {
  const columns = [
    {
      title: 'Customer',
      dataIndex: 'userId',
      key: 'userId',
      width: 200,
      render: (user) => (
        <Space>
          <Avatar src={user?.avatar} icon={<UserOutlined />} />
          <div className="flex flex-col min-w-0 flex-1">
            <Text strong className="truncate">{user?.fullName || 'Unknown User'}</Text>
            <Text type="secondary" className="text-xs truncate">{user?.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Target',
      key: 'target',
      width: 180,
      render: (_, record) => {
        if (record.ratingType === 'FOOD') {
          return (
            <div className="flex flex-col min-w-0">
              <Tag color="orange">FOOD</Tag>
              <Text className="mt-1 font-medium truncate" title={record.foodId?.name}>{record.foodId?.name}</Text>
            </div>
          );
        }
        if (record.ratingType === 'ORDER') {
          return (
            <div className="flex flex-col min-w-0">
              <Tag color="blue">ORDER</Tag>
              <Text className="mt-1 font-medium truncate">{record.orderId?.orderCode}</Text>
            </div>
          );
        }
        return <Tag>{record.ratingType}</Tag>;
      },
    },
    {
      title: 'Rating',
      key: 'rating',
      width: 300,
      render: (_, record) => (
        <div className="flex flex-col min-w-0">
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
      width: 140,
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
      width: 140,
      render: (date) => <Text className="text-slate-500 whitespace-nowrap">{formatDate(date)}</Text>,
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Detail">
            <Typography.Link
              className="flex items-center justify-center w-8 h-8 rounded hover:bg-slate-100"
              onClick={() => onViewDetail && onViewDetail(record._id)}
            >
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
      />
    </div>
  );
};

export default RatingsTable;
