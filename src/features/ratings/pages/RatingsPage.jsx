import React, { useState } from 'react';
import { Card } from 'antd';
import PageHeader from '../../../components/PageHeader';
import RatingsFilterBar from '../components/RatingsFilterBar';
import RatingsTable from '../components/RatingsTable';
import RatingDetailModal from '../components/RatingDetailModal';
import RatingsSummaryCards from '../components/RatingsSummaryCards';
import useRatings from '../hooks/useRatings';
import useRatingDetail from '../hooks/useRatingDetail';
import { COLORS } from '../../orders/utils/orderUtils.jsx';

const RatingsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    ratings,
    loading: listLoading,
    pagination,
    handleTableChange,
    handleFilterChange,
    refresh,
  } = useRatings();

  const {
    detail,
    loading: detailLoading,
    error: detailError,
    fetchDetail,
    clearDetail,
  } = useRatingDetail();

  const handleViewDetail = (id) => {
    setIsModalOpen(true);
    fetchDetail(id);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    clearDetail();
  };

  return (
    <div>
      <PageHeader 
        title="Customer Ratings" 
        description="Manage and respond to customer reviews for foods and orders."
        breadcrumbs={["Dashboard", "Customer Ratings"]}
      />
      
      <RatingsSummaryCards ratings={ratings} />

      <Card
        title="Ratings"
        style={{ borderRadius: 14, boxShadow: "0 2px 10px rgba(20, 20, 43, 0.05)" }}
        extra={
          <RatingsFilterBar 
            onFilterChange={handleFilterChange} 
            loading={listLoading}
          />
        }
      >
        <RatingsTable 
          data={ratings}
          loading={listLoading}
          pagination={pagination}
          onChange={handleTableChange}
          onViewDetail={handleViewDetail}
        />
      </Card>

      <RatingDetailModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        detail={detail}
        loading={detailLoading}
        error={detailError}
        onReplySuccess={() => {
          refresh();
          if (detail && detail._id) fetchDetail(detail._id);
        }}
      />
    </div>
  );
};

export default RatingsPage;
