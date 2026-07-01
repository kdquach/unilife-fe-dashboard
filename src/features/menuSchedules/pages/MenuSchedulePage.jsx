import React, { useState } from 'react';
import { Typography } from 'antd';

const { Title, Text } = Typography;
import useMenuSchedules from '../hooks/useMenuSchedules';
import useMenuScheduleDetail from '../hooks/useMenuScheduleDetail';
import MenuScheduleFilter from '../components/MenuScheduleFilter';
import MenuScheduleTable from '../components/MenuScheduleTable';
import MenuScheduleDetailDrawer from '../components/MenuScheduleDetailDrawer';

const MenuSchedulePage = () => {
  const { 
    data, 
    loading, 
    pagination, 
    handleTableChange, 
    handleFilterChange 
  } = useMenuSchedules();

  const { 
    detail, 
    loading: detailLoading, 
    fetchDetail, 
    resetDetail 
  } = useMenuScheduleDetail();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleViewDetail = (id) => {
    fetchDetail(id);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    resetDetail();
  };

  return (
    <div className="p-6 h-full flex flex-col bg-gray-50/50">
      <div className="mb-6 flex justify-between items-center">
        <div className="mb-6">
          <Title level={3} className="!mb-1">Menu Schedule Management</Title>
          <Text type="secondary">View list and details of menu schedules</Text>
        </div>
      </div>

      <MenuScheduleFilter onFilterChange={handleFilterChange} />

      <div className="flex-1 mt-2">
        <MenuScheduleTable 
          data={data}
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          onViewDetail={handleViewDetail}
        />
      </div>

      <MenuScheduleDetailDrawer
        open={isDrawerOpen}
        onClose={handleCloseDrawer}
        detail={detail}
        loading={detailLoading}
      />
    </div>
  );
};

export default MenuSchedulePage;
