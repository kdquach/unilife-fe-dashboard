import React from 'react';
import PageHeader from '../../../components/PageHeader';
import RatingsFilterBar from '../components/RatingsFilterBar';
import RatingsTable from '../components/RatingsTable';
import useRatings from '../hooks/useRatings';

const RatingsPage = () => {
  const {
    ratings,
    loading,
    pagination,
    handleTableChange,
    handleFilterChange,
  } = useRatings();

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Customer Ratings" 
        subtitle="Manage and respond to customer reviews for foods and orders."
      />
      
      <div className="flex flex-col w-full">
        <RatingsFilterBar 
          onFilterChange={handleFilterChange} 
          loading={loading}
        />
        
        <RatingsTable 
          data={ratings}
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
        />
      </div>
    </div>
  );
};

export default RatingsPage;
