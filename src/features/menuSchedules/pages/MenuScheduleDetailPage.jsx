import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Result, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { formatDate } from '../../../utils/format';
import PageHeader from '../../../components/PageHeader';
import useMenuScheduleDetail from '../hooks/useMenuScheduleDetail';
import MenuScheduleDetailInfo from '../components/MenuScheduleDetailInfo';
import MenuScheduleItemsTable from '../components/MenuScheduleItemsTable';

const MenuScheduleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { detail, loading, error, fetchDetail, resetDetail } = useMenuScheduleDetail();

  useEffect(() => {
    fetchDetail(id, true);
    return () => resetDetail();
  }, [id, fetchDetail, resetDetail]);

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

  if (error) {
    return (
      <div className="p-6">
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

  return (
    <div className="p-6">
      <PageHeader 
        title={backButtonTitle}
        breadcrumbs={["Dashboard", "Menu Schedules", "Detail"]}
        description={detail ? `Schedule Date: ${formatDate(detail.date)}` : "Loading..."}
      />

      <div data-testid="detail-content" className="flex flex-col gap-6">
        <MenuScheduleDetailInfo detail={detail} loading={loading} />
        <MenuScheduleItemsTable items={detail?.items} loading={loading} />
      </div>
    </div>
  );
};

export default MenuScheduleDetailPage;
