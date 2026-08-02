import React from 'react';
import { Space, Input, Select, Button } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';

const { Search } = Input;

const RatingsFilterBar = ({ onFilterChange, loading }) => {
  const [keyword, setKeyword] = React.useState('');
  const [type, setType] = React.useState(null);
  const [hasReply, setHasReply] = React.useState(null);

  const handleSearch = () => {
    onFilterChange({
      keyword: keyword || undefined,
      type: type || undefined,
      hasReply: hasReply !== null ? hasReply : undefined,
    });
  };

  const handleReset = () => {
    setKeyword('');
    setType(null);
    setHasReply(null);
    onFilterChange({
      keyword: undefined,
      type: undefined,
      hasReply: undefined,
    });
  };

  return (
    <Space wrap>
      <Search
        placeholder="Search by keyword..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onSearch={handleSearch}
        allowClear
        enterButton={<SearchOutlined />}
        style={{ width: 280 }}
      />
      
      <Select
        placeholder="Filter by Type"
        value={type}
        onChange={(value) => {
          setType(value);
          handleSearch();
        }}
        style={{ width: 150 }}
        allowClear
        options={[
          { label: 'Food', value: 'FOOD' },
          { label: 'Order', value: 'ORDER' },
          { label: 'Service', value: 'SERVICE' },
          { label: 'Delivery', value: 'DELIVERY' },
        ]}
      />

      <Select
        placeholder="Reply Status"
        value={hasReply}
        onChange={(value) => {
          setHasReply(value);
          handleSearch();
        }}
        style={{ width: 150 }}
        allowClear
        options={[
          { label: 'Replied', value: true },
          { label: 'Not Replied', value: false },
        ]}
      />

      <Button 
        icon={<ClearOutlined />} 
        onClick={handleReset}
        disabled={loading}
      >
        Reset
      </Button>
    </Space>
  );
};

export default RatingsFilterBar;
