import React from 'react';
import { Modal, Descriptions, Tag, Avatar, Space, Typography, Rate, Skeleton, Alert } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { formatDate } from '../../../utils/format';

const { Text, Paragraph } = Typography;

const RatingDetailModal = ({ isOpen, onClose, detail, loading, error }) => {
  return (
    <Modal
      title="Rating Detail"
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      {error && (
        <Alert message={error} type="error" showIcon className="mb-4" />
      )}
      
      {loading ? (
        <Skeleton active avatar paragraph={{ rows: 6 }} />
      ) : detail ? (
        <Descriptions bordered column={1} size="small" layout="vertical">
          <Descriptions.Item label="Customer Information">
            <Space className="w-full">
              <Avatar src={detail.userId?.avatar} icon={<UserOutlined />} size="large" />
              <div className="flex flex-col">
                <Text strong>{detail.userId?.fullName || 'Unknown User'}</Text>
                <Text type="secondary">{detail.userId?.email}</Text>
              </div>
            </Space>
          </Descriptions.Item>

          <Descriptions.Item label="Target">
            {detail.ratingType === 'FOOD' && detail.foodId ? (
              <div className="flex items-center gap-2">
                <Tag color="orange">FOOD</Tag>
                <Text strong>{detail.foodId.name}</Text>
                {detail.foodId.price && (
                  <Text type="secondary">({detail.foodId.price.toLocaleString()} VND)</Text>
                )}
              </div>
            ) : detail.ratingType === 'ORDER' && detail.orderId ? (
              <div className="flex items-center gap-2">
                <Tag color="blue">ORDER</Tag>
                <Text strong>{detail.orderId.orderCode}</Text>
                {detail.orderId.totalAmount && (
                  <Text type="secondary">({detail.orderId.totalAmount.toLocaleString()} VND)</Text>
                )}
              </div>
            ) : (
              <Tag>{detail.ratingType}</Tag>
            )}
          </Descriptions.Item>

          <Descriptions.Item label="Rating & Comment">
            <div className="flex flex-col gap-2">
              <Rate disabled value={detail.stars} className="text-lg" />
              {detail.comment ? (
                <Paragraph className="mb-0 p-3 bg-slate-50 rounded-md border border-slate-100 text-slate-700">
                  {detail.comment}
                </Paragraph>
              ) : (
                <Text type="secondary" italic>No comment provided.</Text>
              )}
            </div>
          </Descriptions.Item>

          {detail.staffReply && (
            <Descriptions.Item label="Staff Reply">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Space>
                    <Avatar src={detail.repliedBy?.avatar} icon={<UserOutlined />} size="small" />
                    <Text strong>{detail.repliedBy?.fullName || 'Staff'}</Text>
                    {detail.repliedBy?.role && <Tag color="blue">{detail.repliedBy.role}</Tag>}
                  </Space>
                  {detail.repliedAt && (
                    <Text type="secondary" className="text-xs">{formatDate(detail.repliedAt)}</Text>
                  )}
                </div>
                <Paragraph className="mb-0 p-3 bg-blue-50 rounded-md border border-blue-100 text-blue-800">
                  {detail.staffReply}
                </Paragraph>
              </div>
            </Descriptions.Item>
          )}
        </Descriptions>
      ) : (
        !error && <div className="text-center py-8 text-slate-500">No detail available</div>
      )}
    </Modal>
  );
};

export default RatingDetailModal;
