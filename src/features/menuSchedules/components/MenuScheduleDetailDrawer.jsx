import React from 'react';
import { Drawer, Spin, Empty, Tag, Card, Divider, Image } from 'antd';
import { formatDate } from '../../../utils/format';
import { getImageUrl, imageNotFound } from '../../../utils/image';

const MenuScheduleDetailDrawer = ({ open, onClose, detail, loading }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'PUBLISHED': return 'green';
      case 'DRAFT': return 'gold';
      case 'CANCELLED': return 'red';
      default: return 'default';
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" tip="Loading details..." />
        </div>
      );
    }

    if (!detail) {
      return (
        <div className="flex justify-center items-center h-64">
          <Empty description="No data available" />
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            Menu Schedule: {formatDate(detail.date)}
          </h2>
          <Tag color={getStatusColor(detail.status)} className="text-sm px-3 py-1 rounded-full">
            {detail.status}
          </Tag>
        </div>

        <Divider className="my-2" />

        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Menu Items ({detail.items?.length || 0})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {detail.items && detail.items.length > 0 ? (
              detail.items.map((item) => (
                <Card 
                  key={item._id} 
                  className="shadow-sm hover:shadow-md transition-shadow border border-gray-100 rounded-xl"
                  styles={{ body: { padding: '20px' } }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      <Image
                        src={getImageUrl(item.foodId?.imageUrl)}
                        fallback={imageNotFound}
                        alt={item.foodId?.name}
                        width={80}
                        height={80}
                        style={{ objectFit: 'cover' }}
                        preview={false}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-800 line-clamp-1" title={item.foodId?.name}>
                        {item.foodId?.name || 'Unknown Item'}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2 line-clamp-2" title={item.foodId?.description}>
                        {item.foodId?.description || 'No description'}
                      </p>
                      <div className="flex flex-wrap gap-y-2 justify-between items-center mt-2 bg-gray-50 p-2 rounded-md">
                        <div className="text-xs font-medium text-gray-600">
                          Serving: <span className="text-gray-900 font-bold">{item.maxServing} portions</span>
                        </div>
                        <div className="text-xs font-medium text-blue-600">
                          Price: <span className="font-bold">{item.foodId?.price?.toLocaleString() || 0}đ</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full">
                <Empty description="No items found in this schedule" />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Drawer
      title="Menu Schedule Details"
      placement="right"
      width={720}
      onClose={onClose}
      open={open}
      destroyOnHidden
    >
      {renderContent()}
    </Drawer>
  );
};

export default MenuScheduleDetailDrawer;
