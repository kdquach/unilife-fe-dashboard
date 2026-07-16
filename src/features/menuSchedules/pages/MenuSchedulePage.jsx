import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useMenuSchedules from '../hooks/useMenuSchedules';
import MenuScheduleTable from '../components/MenuScheduleTable';
import MenuScheduleCreateModal from '../components/MenuScheduleCreateModal';
import PageHeader from '../../../components/PageHeader';
import { Button, Card, Select, DatePicker, Switch, Space } from 'antd';
import { PlusOutlined, ReloadOutlined, CalendarOutlined } from '@ant-design/icons';
import useCreateMenuSchedule from '../hooks/useCreateMenuSchedule';

const { RangePicker } = DatePicker;

const MenuSchedulePage = () => {
  const { 
    data, 
    loading, 
    pagination, 
    handleTableChange, 
    handleFilterChange,
    refresh
  } = useMenuSchedules();

  const { createSchedule, isSubmitting } = useCreateMenuSchedule();
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [filters, setFilters] = React.useState({
    status: [],
    dateRange: null,
    includeInactive: false
  });

  const navigate = useNavigate();

  const handleViewDetail = (id) => {
    navigate(`/menu-schedules/${id}`);
  };

  const handleCreateSchedule = async (values) => {
    try {
      const response = await createSchedule(values);
      if (response.success) {
        setIsCreateModalOpen(false);
        refresh(); // Invalidate cache / refetch
        if (response.data?._id) {
          navigate(`/menu-schedules/${response.data._id}`);
        }
      }
    } catch {
      // Error is handled in the hook
    }
  };

  const applyFilters = (newFilters) => {
    const merged = { ...filters, ...newFilters };
    setFilters(merged);
    
    handleFilterChange({
      status: merged.status.length > 0 ? merged.status.join(',') : undefined,
      dateFrom: merged.dateRange?.[0] ? merged.dateRange[0].format('YYYY-MM-DD') : undefined,
      dateTo: merged.dateRange?.[1] ? merged.dateRange[1].format('YYYY-MM-DD') : undefined,
      includeInactive: merged.includeInactive ? true : undefined,
    });
  };

  const stats = useMemo(() => {
    const items = data || [];
    return {
      total: items.length,
      published: items.filter(s => s.status === 'PUBLISHED').length,
      draft: items.filter(s => s.status === 'DRAFT').length,
      cancelled: items.filter(s => s.status === 'CANCELLED').length,
    };
  }, [data]);

  return (
    <div>
      <PageHeader
        title="Menu Schedule Management"
        breadcrumbs={['Dashboard', 'Menu Schedules']}
        description="View list and details of menu schedules"
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create New Schedule
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="dashboard-card">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-unilife-soft text-xl text-unilife">
              <CalendarOutlined />
            </div>
            <div>
              <div className="text-sm text-slate-500">On Page</div>
              <div className="text-2xl font-bold text-slate-950">
                {stats.total}
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="dashboard-card">
          <div className="text-sm text-slate-500">Published</div>
          <div className="mt-1 text-2xl font-bold text-green-600">
            {stats.published}
          </div>
        </Card>

        <Card className="dashboard-card">
          <div className="text-sm text-slate-500">Draft</div>
          <div className="mt-1 text-2xl font-bold text-orange-500">
            {stats.draft}
          </div>
        </Card>

        <Card className="dashboard-card">
          <div className="text-sm text-slate-500">Cancelled</div>
          <div className="mt-1 text-2xl font-bold text-red-500">
            {stats.cancelled}
          </div>
        </Card>
      </div>

      <Card
        className="dashboard-card"
        title="Menu Schedules"
        extra={
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <Select
              mode="multiple"
              allowClear
              placeholder="Status"
              style={{ minWidth: 150 }}
              value={filters.status}
              onChange={(value) => applyFilters({ status: value })}
              options={[
                { label: 'Draft', value: 'DRAFT' },
                { label: 'Published', value: 'PUBLISHED' },
                { label: 'Cancelled', value: 'CANCELLED' },
              ]}
            />
            
            <RangePicker 
              value={filters.dateRange}
              onChange={(dates) => applyFilters({ dateRange: dates })}
              format="DD/MM/YYYY"
            />

            <Space>
              <Switch 
                checked={filters.includeInactive} 
                onChange={(checked) => applyFilters({ includeInactive: checked })} 
              />
              <span className="text-sm text-slate-500">Show Inactive</span>
            </Space>

            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => {
                setFilters({ status: [], dateRange: null, includeInactive: false });
                handleFilterChange({
                  status: undefined,
                  dateFrom: undefined,
                  dateTo: undefined,
                  includeInactive: undefined
                });
              }}
            />
          </div>
        }
      >
        <MenuScheduleTable 
          data={data}
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          onViewDetail={handleViewDetail}
        />
      </Card>

      <MenuScheduleCreateModal
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateSchedule}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default MenuSchedulePage;
