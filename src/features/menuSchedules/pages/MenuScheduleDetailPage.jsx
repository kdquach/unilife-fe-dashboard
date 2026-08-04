import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Result, Space, Modal, Alert, Spin } from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import { formatDate } from '../../../utils/format';
import dayjs from 'dayjs';
import PageHeader from '../../../components/PageHeader';
import useMenuScheduleDetail from '../hooks/useMenuScheduleDetail';
import useUpdateMenuSchedule from '../hooks/useUpdateMenuSchedule';
import useCreateScheduleItem from '../hooks/useCreateScheduleItem';
import useUpdateScheduleItem from '../hooks/useUpdateScheduleItem';
import MenuScheduleDetailInfo from '../components/MenuScheduleDetailInfo';
import MenuScheduleItemsTable from '../components/MenuScheduleItemsTable';
import MenuScheduleUpdateModal from '../components/MenuScheduleUpdateModal';
import MenuScheduleItemCreateModal from '../components/MenuScheduleItemCreateModal';

const MenuScheduleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { detail, loading, error, fetchDetail, resetDetail } = useMenuScheduleDetail();
  const { updateSchedule, isSubmitting } = useUpdateMenuSchedule();
  const { createItem, createBulkItems, isSubmitting: isAddingItem } = useCreateScheduleItem();
  const { updateItem } = useUpdateScheduleItem();
  
  const [isUpdateModalOpen, setIsUpdateModalOpen] = React.useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = React.useState(false);

  useEffect(() => {
    console.log('MenuScheduleDetailPage mounted, id:', id);
    fetchDetail(id, true);
    return () => resetDetail();
  }, [id, fetchDetail, resetDetail]);

  const totalReservedCount = React.useMemo(() => {
    if (!detail || !detail.items) return 0;
    // Check if any customer has interacted with this schedule (either reserved or already served)
    return detail.items.reduce((sum, item) => sum + (item.reservedCount || 0) + (item.servedCount || 0), 0);
  }, [detail]);

  const handleUpdate = async (values) => {
    try {
      const response = await updateSchedule(id, values);
      if (response.success) {
        setIsUpdateModalOpen(false);
        fetchDetail(id, true); // Refresh data
      }
    } catch (err) {
      if (err.response?.status === 409) {
        Modal.error({
          title: 'Data Conflict',
          content: 'Data was modified by another user. Please reload the page to get the latest data.',
          okText: 'Reload',
          onOk: () => {
            setIsUpdateModalOpen(false);
            fetchDetail(id, true);
          },
        });
      }
    }
  };

  const handleAddItem = (values) => {
    if (values.items && Array.isArray(values.items)) {
      createBulkItems(
        { menuScheduleId: id, items: values.items },
        { onSuccess: () => { setIsAddItemModalOpen(false); fetchDetail(id, true); } }
      );
    } else {
      createItem(
        { menuScheduleId: id, ...values },
        { onSuccess: () => { setIsAddItemModalOpen(false); fetchDetail(id, true); } }
      );
    }
  };

  const handleUpdateItem = async (itemId, payload) => {
    try {
      await updateItem(itemId, payload, { onSuccess: () => fetchDetail(id, true) });
    } catch (err) {
      if (err.response?.status === 409) {
        Modal.error({
          title: 'Data Conflict',
          content: 'Data was modified by another user. Please reload the page to get the latest data.',
          okText: 'Reload',
          onOk: () => fetchDetail(id, true),
        });
      }
    }
  };
  
  const handleToggleActiveItem = (itemId, isActive, __v) => {
    if (!isActive) {
      const scheduleDate = dayjs(detail.date).startOf('day');
      const today = dayjs().startOf('day');
      const isFuture = scheduleDate.isAfter(today);
      
      Modal.confirm({
        title: 'Deactivate Food Item',
        content: isFuture 
          ? 'This menu schedule is in the future. Deactivating this item will refund its reserved ingredients back to the inventory. Are you sure you want to proceed?'
          : 'This menu schedule is for today or the past. Deactivating this item will hide it from students, but the ingredients will NOT be refunded to the inventory (considered consumed/wasted). Are you sure you want to proceed?',
        okText: 'Yes, Deactivate',
        okType: 'danger',
        cancelText: 'Cancel',
        onOk: () => {
          handleUpdateItem(itemId, { isActive, __v });
        }
      });
    } else {
      handleUpdateItem(itemId, { isActive, __v });
    }
  };

  const isTerminalState = detail?.status === 'CANCELLED' || detail?.status === 'COMPLETED';

  const backButtonTitle = (
    <Space className="items-center">
      <Button 
        type="text" 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/menu-schedules')}
        className="flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 mr-1"
        data-testid="back-button"
      />
      Menu Schedule Details
    </Space>
  );

  const extraActions = !loading && detail && !isTerminalState ? (
    <Button 
      type="primary" 
      icon={<EditOutlined />} 
      onClick={() => setIsUpdateModalOpen(true)}
      className="bg-blue-600 hover:bg-blue-700"
    >
      Edit Schedule
    </Button>
  ) : null;

  if (error) {
    return (
      <div>
        <PageHeader 
          title={backButtonTitle}
        />
        <Result
          status="error"
          title="Failed to load menu schedule details"
          subTitle={error}
          extra={[
            <Button key="retry" type="primary" onClick={() => fetchDetail(id, true)}>
              Try Again
            </Button>
          ]}
        />
      </div>
    );
  }

  if (loading && !detail) {
    return (
      <div>
        <PageHeader 
          title={backButtonTitle}
        />
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title={backButtonTitle}
        breadcrumbs={["Dashboard", "Menu Schedules", "Detail"]}
        description={detail ? `Schedule Date: ${formatDate(detail.date)}` : "Loading..."}
        extra={extraActions}
      />

      <div data-testid="detail-content" className="flex flex-col gap-6">
        <MenuScheduleDetailInfo detail={detail} loading={loading} />
        <MenuScheduleItemsTable 
          items={detail?.items} 
          loading={loading}
          isReadOnly={isTerminalState}
          onUpdateItem={handleUpdateItem}
          onToggleActive={handleToggleActiveItem}
          onOpenAddModal={() => setIsAddItemModalOpen(true)}
        />
      </div>

      <MenuScheduleUpdateModal
        open={isUpdateModalOpen}
        onCancel={() => setIsUpdateModalOpen(false)}
        onUpdate={handleUpdate}
        isSubmitting={isSubmitting}
        initialData={detail}
        totalReservedCount={totalReservedCount}
      />

      <MenuScheduleItemCreateModal
        open={isAddItemModalOpen}
        onCancel={() => setIsAddItemModalOpen(false)}
        onCreate={handleAddItem}
        isSubmitting={isAddingItem}
        existingFoodIds={detail?.items?.map(item => item.foodId?._id || item.foodId) || []}
      />
    </div>
  );
};

export default MenuScheduleDetailPage;
