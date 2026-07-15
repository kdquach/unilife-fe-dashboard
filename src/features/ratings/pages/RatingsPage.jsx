import React, { useState } from 'react';
import PageHeader from '../../../components/PageHeader';
import RatingsFilterBar from '../components/RatingsFilterBar';
import RatingsTable from '../components/RatingsTable';
import RatingDetailModal from '../components/RatingDetailModal';
import useRatings from '../hooks/useRatings';
import useRatingDetail from '../hooks/useRatingDetail';

const RatingsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    ratings,
    loading: listLoading,
    pagination,
    handleTableChange,
    handleFilterChange,
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
    <div className="space-y-6">
      <PageHeader 
        title="Customer Ratings" 
        subtitle="Manage and respond to customer reviews for foods and orders."
      />
      
      <div className="flex flex-col w-full">
        <RatingsFilterBar 
          onFilterChange={handleFilterChange} 
          loading={listLoading}
        />
        
        <RatingsTable 
          data={ratings}
          loading={listLoading}
          pagination={pagination}
          onChange={handleTableChange}
          onViewDetail={handleViewDetail}
        />
      </div>

      <RatingDetailModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        detail={detail}
        loading={detailLoading}
        error={detailError}
      />
    </div>
  );
};

export default RatingsPage;
