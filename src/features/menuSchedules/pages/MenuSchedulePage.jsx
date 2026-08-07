import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useMenuSchedules from '../hooks/useMenuSchedules';
import MenuScheduleTable from '../components/MenuScheduleTable';
import MenuScheduleCreateModal from '../components/MenuScheduleCreateModal';
import PageHeader from '../../../components/PageHeader';
import { COLORS } from '../../orders/utils/orderUtils.jsx';
import { Button, Card, Select, DatePicker, Switch, Space, Alert, Spin } from 'antd';
import { PlusOutlined, ReloadOutlined, CalendarOutlined, CheckCircleOutlined, EditOutlined, CloseCircleOutlined } from '@ant-design/icons';
import useCreateMenuSchedule from '../hooks/useCreateMenuSchedule';

const { RangePicker } = DatePicker;

const MenuSchedulePage = () => {
  const { 
    data, 
    loading, 
    pagination, 
    error,
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
        extra={
          <Space wrap>
            <Button 
              icon={<ReloadOutlined />}
              onClick={refresh}
            >
              Refresh
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create New Schedule
            </Button>
          </Space>
        }
      />

      {error && (
        <Alert
          message="Error loading menu schedules"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => refresh()}
          style={{ marginBottom: 16 }}
        />
      )}

      {loading && !data.length ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card
          className="dashboard-card"
          styles={{ body: { padding: "16px 18px" } }}
          style={{
            borderRadius: 14,
            borderTop: `3px solid ${COLORS.orange}`,
            boxShadow: "0 2px 10px rgba(20, 20, 43, 0.05)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">On Page</div>
              <div className="mt-1 text-2xl font-bold" style={{ color: COLORS.orange }}>
                {stats.total}
              </div>
            </div>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `${COLORS.orange}1a`,
                color: COLORS.orange,
                fontSize: 18,
              }}
            >
              <CalendarOutlined />
            </div>
          </div>
        </Card>

        <Card
          className="dashboard-card"
          styles={{ body: { padding: "16px 18px" } }}
          style={{
            borderRadius: 14,
            borderTop: `3px solid ${COLORS.green}`,
            boxShadow: "0 2px 10px rgba(20, 20, 43, 0.05)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">Published</div>
              <div className="mt-1 text-2xl font-bold" style={{ color: COLORS.green }}>
                {stats.published}
              </div>
            </div>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `${COLORS.green}1a`,
                color: COLORS.green,
                fontSize: 18,
              }}
            >
              <CheckCircleOutlined />
            </div>
          </div>
        </Card>

        <Card
          className="dashboard-card"
          styles={{ body: { padding: "16px 18px" } }}
          style={{
            borderRadius: 14,
            borderTop: `3px solid ${COLORS.orange}`,
            boxShadow: "0 2px 10px rgba(20, 20, 43, 0.05)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">Draft</div>
              <div className="mt-1 text-2xl font-bold" style={{ color: COLORS.orange }}>
                {stats.draft}
              </div>
            </div>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `${COLORS.orange}1a`,
                color: COLORS.orange,
                fontSize: 18,
              }}
            >
              <EditOutlined />
            </div>
          </div>
        </Card>

        <Card
          className="dashboard-card"
          styles={{ body: { padding: "16px 18px" } }}
          style={{
            borderRadius: 14,
            borderTop: `3px solid ${COLORS.red}`,
            boxShadow: "0 2px 10px rgba(20, 20, 43, 0.05)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">Cancelled</div>
              <div className="mt-1 text-2xl font-bold" style={{ color: COLORS.red }}>
                {stats.cancelled}
              </div>
            </div>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `${COLORS.red}1a`,
                color: COLORS.red,
                fontSize: 18,
              }}
            >
              <CloseCircleOutlined />
            </div>
          </div>
        </Card>
      </div>

      <Card
        title="Menu Schedules"
        style={{ borderRadius: 14, boxShadow: "0 2px 10px rgba(20, 20, 43, 0.05)" }}
        extra={
          <Space wrap>
            <Select
              allowClear
              placeholder="Status"
              style={{ width: 140 }}
              value={filters.status.length > 0 ? filters.status[0] : undefined}
              onChange={(value) => applyFilters({ status: value ? [value] : [] })}
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
          </Space>
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
      </>
      )}

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
