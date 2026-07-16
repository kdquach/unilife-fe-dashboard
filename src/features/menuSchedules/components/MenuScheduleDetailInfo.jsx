import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Tag } from 'antd';
import { formatDate, formatDateTime } from '../../../utils/format';
import { staffService } from '../../staffs/staffService';

const MenuScheduleDetailInfo = ({ detail, loading }) => {
  const [creatorInfo, setCreatorInfo] = useState(null);

  useEffect(() => {
    if (detail?.createdBy && typeof detail.createdBy === 'string') {
      const fetchUser = async () => {
        try {
          const response = await staffService.getStaffById(detail.createdBy);
          if (response) {
            setCreatorInfo(response);
          }
        } catch (error) {
          console.error("Failed to fetch creator info", error);
        }
      };
      fetchUser();
    } else if (detail?.createdBy && typeof detail.createdBy === 'object') {
      setCreatorInfo(detail.createdBy);
    }
  }, [detail]);

  if (loading) {
    return <Card loading={true} className="mb-6 rounded-3xl border border-slate-100 shadow-soft" />;
  }

  if (!detail) {
    return null;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PUBLISHED': return 'green';
      case 'DRAFT': return 'orange';
      case 'CANCELLED': return 'red';
      default: return 'blue';
    }
  };

  return (
    <Card className="mb-6 rounded-3xl border border-slate-100 bg-white shadow-soft">
      <Descriptions title="Schedule Information" column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
        <Descriptions.Item label="Serving Date">
          <span className="font-medium text-slate-800">
            {formatDate(detail.date)}
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color={getStatusColor(detail.status)} className="rounded-full px-3">
            {detail.status}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Created By">
          <span className="text-slate-600">
            {creatorInfo?.fullName 
              ? `${creatorInfo.fullName} - ${creatorInfo.role || 'Admin'}`
              : (typeof detail.createdBy === 'string' ? `User ID: ${detail.createdBy}` : 'System')}
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="Published At">
          <span className="text-slate-600">
            {detail.publishedAt ? formatDateTime(detail.publishedAt) : 'N/A'}
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="Created At">
          <span className="text-slate-600">
            {formatDateTime(detail.createdAt)}
          </span>
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default MenuScheduleDetailInfo;
