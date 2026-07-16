import React from 'react';
import { Space, Input, Select, DatePicker, Button, Card } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;

const RatingsFilterBar = ({ onFilterChange, loading }) => {
  const [keyword, setKeyword] = React.useState('');
  const [type, setType] = React.useState(null);
  const [stars, setStars] = React.useState(null);
  const [hasReply, setHasReply] = React.useState(null);
  const [dates, setDates] = React.useState(null);

  const handleSearch = () => {
    onFilterChange({
      keyword: keyword || undefined,
      type: type || undefined,
      stars: stars || undefined,
      hasReply: hasReply !== null ? hasReply : undefined,
      startDate: dates?.[0] ? dates[0].format('YYYY-MM-DD') : undefined,
      endDate: dates?.[1] ? dates[1].format('YYYY-MM-DD') : undefined,
    });
  };

  const handleReset = () => {
    setKeyword('');
    setType(null);
    setStars(null);
    setHasReply(null);
    setDates(null);
    onFilterChange({
      keyword: undefined,
      type: undefined,
      stars: undefined,
      hasReply: undefined,
      startDate: undefined,
      endDate: undefined,
    });
  };

  return (
    <Card className="mb-6 shadow-sm border-slate-200">
      <Space wrap size="middle" className="w-full">
        <Input
          placeholder="Search by keyword..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onPressEnter={handleSearch}
          prefix={<SearchOutlined className="text-slate-400" />}
          className="w-64"
          allowClear
        />
        
        <Select
          placeholder="Filter by Type"
          value={type}
          onChange={setType}
          className="w-40"
          allowClear
          options={[
            { label: 'Food', value: 'FOOD' },
            { label: 'Order', value: 'ORDER' },
            { label: 'Service', value: 'SERVICE' },
            { label: 'Delivery', value: 'DELIVERY' },
          ]}
        />

        <Select
          placeholder="Stars"
          value={stars}
          onChange={setStars}
          className="w-32"
          allowClear
          options={[
            { label: '5 Stars', value: 5 },
            { label: '4 Stars', value: 4 },
            { label: '3 Stars', value: 3 },
            { label: '2 Stars', value: 2 },
            { label: '1 Star', value: 1 },
          ]}
        />

        <Select
          placeholder="Reply Status"
          value={hasReply}
          onChange={setHasReply}
          className="w-40"
          allowClear
          options={[
            { label: 'Replied', value: true },
            { label: 'Not Replied', value: false },
          ]}
        />

        <RangePicker 
          value={dates}
          onChange={setDates}
          className="w-64"
        />

        <Button 
          type="primary" 
          icon={<SearchOutlined />} 
          onClick={handleSearch}
          loading={loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Apply Filters
        </Button>
        <Button 
          icon={<ClearOutlined />} 
          onClick={handleReset}
          disabled={loading}
        >
          Reset
        </Button>
      </Space>
    </Card>
  );
};

export default RatingsFilterBar;
