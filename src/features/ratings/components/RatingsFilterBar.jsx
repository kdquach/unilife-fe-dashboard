import React from 'react';
import { Space, Input, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

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

  return (
    <Space wrap>
      <Search
        placeholder="Search by keyword..."
        allowClear
        enterButton={<SearchOutlined />}
        style={{ width: 280 }}
        onSearch={handleSearch}
        onChange={(e) => setKeyword(e.target.value)}
      />
      
      <Select
        placeholder="Filter by Type"
        value={type}
        onChange={(value) => {
          setType(value);
          handleSearch();
        }}
        onClear={() => {
          setType(null);
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
        onClear={() => {
          setHasReply(null);
          handleSearch();
        }}
        style={{ width: 150 }}
        allowClear
        options={[
          { label: 'Replied', value: true },
          { label: 'Not Replied', value: false },
        ]}
      />
    </Space>
  );
};

export default RatingsFilterBar;
