import React from 'react';
import { Select, DatePicker, Space } from 'antd';

const { RangePicker } = DatePicker;

const MenuScheduleFilter = ({ filters = {}, onFilterChange }) => {
  return (
    <Space wrap>
      <Select
        allowClear
        placeholder="Status"
        style={{ width: 140 }}
        value={filters?.status}
        onChange={(value) => onFilterChange?.({ ...filters, status: value })}
        options={[
          { label: 'Draft', value: 'DRAFT' },
          { label: 'Published', value: 'PUBLISHED' },
          { label: 'Cancelled', value: 'CANCELLED' },
        ]}
      />
      
      <RangePicker
        value={filters.dateRange}
        onChange={(dates) => onFilterChange({ ...filters, dateRange: dates })}
        format="DD/MM/YYYY"
      />
    </Space>
  );
};

export default MenuScheduleFilter;
