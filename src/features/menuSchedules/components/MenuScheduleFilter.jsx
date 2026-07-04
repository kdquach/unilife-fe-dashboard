import React, { useState } from 'react';
import { Select, DatePicker, Button } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { Option } = Select;

const MenuScheduleFilter = ({ onFilterChange }) => {
  const [status, setStatus] = useState([]);
  const [dateRange, setDateRange] = useState(null);

  const handleApplyFilter = () => {
    const filters = {
      status: status.length > 0 ? status.join(',') : undefined,
      dateFrom: dateRange?.[0] ? dateRange[0].format('YYYY-MM-DD') : undefined,
      dateTo: dateRange?.[1] ? dateRange[1].format('YYYY-MM-DD') : undefined,
    };
    onFilterChange(filters);
  };

  const handleReset = () => {
    setStatus([]);
    setDateRange(null);
    onFilterChange({ status: undefined, dateFrom: undefined, dateTo: undefined });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
      <div className="flex flex-col md:flex-row gap-6 items-end">
        <div className="flex-1 w-full">
          <div className="text-sm font-medium text-gray-700 mb-1">Filter by status</div>
          <Select
            mode="multiple"
            allowClear
            className="w-full"
            placeholder="Select status"
            value={status}
            onChange={setStatus}
          >
            <Option value="DRAFT">Draft</Option>
            <Option value="PUBLISHED">Published</Option>
            <Option value="CANCELLED">Cancelled</Option>
          </Select>
        </div>
        <div className="flex-1 w-full">
          <div className="text-sm font-medium text-gray-700 mb-1">From date - To date</div>
          <RangePicker 
            className="w-full" 
            value={dateRange}
            onChange={setDateRange}
            format="DD/MM/YYYY"
          />
        </div>
        <div className="flex gap-2">
          <Button 
            type="primary" 
            icon={<SearchOutlined />} 
            onClick={handleApplyFilter}
          >
            Search
          </Button>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleReset}
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MenuScheduleFilter;
