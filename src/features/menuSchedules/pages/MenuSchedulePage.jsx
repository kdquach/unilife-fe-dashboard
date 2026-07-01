import React from 'react';
import { useNavigate } from 'react-router-dom';
import useMenuSchedules from '../hooks/useMenuSchedules';
import MenuScheduleFilter from '../components/MenuScheduleFilter';
import MenuScheduleTable from '../components/MenuScheduleTable';
import PageHeader from '../../../components/PageHeader';

const MenuSchedulePage = () => {
  const { 
    data, 
    loading, 
    pagination, 
    handleTableChange, 
    handleFilterChange 
  } = useMenuSchedules();

  const navigate = useNavigate();

  const handleViewDetail = (id) => {
    navigate(`/menu-schedules/${id}`);
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <PageHeader
        title="Menu Schedule Management"
        breadcrumbs={['Dashboard', 'Menu Schedules']}
        description="View list and details of menu schedules"
      />

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
    </div>
  );
};

export default MenuSchedulePage;
