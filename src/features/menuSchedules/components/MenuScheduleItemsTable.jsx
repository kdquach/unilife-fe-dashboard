import React, { useState, useMemo, useDeferredValue } from 'react';
import { Table, Input, Tag, Switch, Space, Empty, Typography, Button, Modal, Form, InputNumber, Image } from 'antd';
import { SearchOutlined, EditOutlined, PlusOutlined, StopOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { getImageUrl, imageNotFound } from '../../../utils/image';

const { Search } = Input;
const { Text } = Typography;

const MenuScheduleItemsTable = ({ items, loading, isReadOnly, onUpdateItem, onToggleActive, onOpenAddModal }) => {
  const [searchText, setSearchText] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  // Edit Modal State
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  const deferredSearchText = useDeferredValue(searchText);

  const filteredItems = useMemo(() => {
    if (!items || !Array.isArray(items)) return [];
    
    return items.filter(item => {
      const foodName = item?.foodId?.name || '';
      const matchesSearch = foodName.toLowerCase().includes(deferredSearchText.toLowerCase());
      const matchesActive = showInactive ? true : item.isActive === true;
      return matchesSearch && matchesActive;
    });
  }, [items, deferredSearchText, showInactive]);

  const handleEditClick = (record) => {
    setEditingItem(record);
    form.setFieldsValue({ maxServing: record.maxServing });
  };

  const handleUpdateMaxServing = async () => {
    try {
      const values = await form.validateFields();
      if (onUpdateItem && editingItem) {
        await onUpdateItem(editingItem.menuScheduleItemId, { 
          maxServing: values.maxServing,
          __v: editingItem.__v 
        });
        setEditingItem(null);
      }
    } catch {
      // Form validation failed or API failed
    }
  };

  const columns = [
    {
      title: 'Food Item',
      key: 'name',
      sorter: (a, b) => {
        const nameA = a?.foodId?.name || '';
        const nameB = b?.foodId?.name || '';
        return nameA.localeCompare(nameB);
      },
      render: (_, record) => {
        const imageUrl = getImageUrl(record?.foodId?.imageUrl);

        return (
          <div className="flex min-w-[260px] items-center gap-3">
            <Image
              src={imageUrl}
              fallback={imageNotFound}
              width={64}
              height={64}
              className="rounded-md object-cover"
              preview={Boolean(imageUrl)}
            />

            <div className="min-w-0">
              <Text strong className="block">
                {record?.foodId?.name || <Text type="secondary" italic>Unknown Item</Text>}
              </Text>

              <Text className="text-xs text-slate-500 line-clamp-1 max-w-[200px] block">
                {record?.foodId?.description || 'No description available'}
              </Text>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Category',
      key: 'category',
      render: (_, record) => {
        const catName = record?.foodId?.categoryId?.name;
        return catName ? (
          <Tag className="rounded-md bg-blue-50 text-blue-600 border-blue-100 px-2 py-1">
            {catName}
          </Tag>
        ) : (
          <Text type="secondary" className="text-xs">Uncategorized</Text>
        );
      }
    },
    {
      title: 'Price',
      key: 'price',
      sorter: (a, b) => (a?.foodId?.price || 0) - (b?.foodId?.price || 0),
      render: (_, record) => {
        const price = record?.foodId?.price;
        return (
          <span className="font-semibold text-emerald-600">
            {price ? `${price.toLocaleString()} ₫` : 'N/A'}
          </span>
        );
      },
    },
    {
      title: 'Capacity',
      key: 'capacity',
      render: (_, record) => (
        <div className="flex flex-col gap-1">
          <div className="flex justify-between w-24">
            <span className="text-xs text-slate-500">Max:</span>
            <span className="text-xs font-medium text-slate-700">{record.maxServing || 0}</span>
          </div>
          <div className="flex justify-between w-24">
            <span className="text-xs text-slate-500">Reserved:</span>
            <span className="text-xs font-medium text-slate-700">{record.reservedCount || 0}</span>
          </div>
          <div className="flex justify-between w-24 mt-0.5">
            <span className="text-xs text-slate-500">Served:</span>
            <span className="text-xs font-medium text-slate-700">{record.servedCount || 0}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Remaining',
      key: 'remainingCount',
      sorter: (a, b) => (a.remainingCount || 0) - (b.remainingCount || 0),
      render: (_, record) => {
        const count = record.remainingCount || 0;
        let color = count > 10 ? 'green' : count > 0 ? 'orange' : 'red';
        return (
          <Tag color={color} className="rounded-full px-3 font-medium shadow-sm">
            {count} left
          </Tag>
        );
      },
    },
    {
      title: 'Status',
      key: 'isActive',
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
      render: (_, record) => (
        <Tag 
          color={record.isActive ? 'success' : 'default'} 
          className={`rounded-full px-3 font-medium ${!record.isActive && 'bg-slate-50 text-slate-500'}`}
        >
          {record.isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
  ];

  if (!isReadOnly) {
    columns.push({
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EditOutlined className="text-blue-500" />} 
            onClick={() => handleEditClick(record)}
            title="Edit max servings"
          />
          <Button 
            type="text" 
            icon={record.isActive ? <StopOutlined className="text-orange-500" /> : <CheckCircleOutlined className="text-emerald-500" />} 
            onClick={() => onToggleActive && onToggleActive(record.menuScheduleItemId, !record.isActive, record.__v)}
            title={record.isActive ? "Deactivate (Stop selling)" : "Activate"}
          />
        </Space>
      )
    });
  }

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-800 m-0">Menu Items</h3>
          <p className="text-sm text-slate-500 m-0 mt-1">Manage and track food availability</p>
        </div>
        <Space size="middle" className="flex-wrap">
          {!isReadOnly && (
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={onOpenAddModal}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add New Food
            </Button>
          )}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100">
            <span className="text-sm text-slate-600">Show Inactive</span>
            <Switch 
              size="small"
              checked={showInactive} 
              onChange={setShowInactive} 
            />
          </div>
          <Search
            placeholder="Search food by name..."
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 280 }}
            className="rounded-full"
            prefix={<SearchOutlined className="text-slate-400" />}
          />
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredItems}
        rowKey="_id"
        loading={loading}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => (
            <span className="text-slate-500 font-medium">
              Showing {range[0]}-{range[1]} of {total} items
            </span>
          ),
          className: 'mt-6',
        }}
        locale={{
          emptyText: (
            <Empty 
              description={<span className="text-slate-400">No food items found matching your criteria</span>} 
              image={Empty.PRESENTED_IMAGE_SIMPLE} 
              className="py-10"
            />
          )
        }}
        scroll={{ x: 900 }}
        rowClassName="hover:bg-slate-50/50 transition-colors"
      />

      {/* Edit Max Serving Modal */}
      <Modal
        title="Update Food Serving Capacity"
        open={!!editingItem}
        onOk={handleUpdateMaxServing}
        onCancel={() => setEditingItem(null)}
        okText="Update"
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4">
          <div className="mb-4 text-sm text-slate-600">
            Current minimum allowed: <strong>{(editingItem?.reservedCount || 0) + (editingItem?.servedCount || 0)}</strong> (Reserved + Served).
          </div>
          <Form.Item
            name="maxServing"
            label="Max Serving"
            rules={[
              { required: true, message: 'Please enter maximum servings' },
              { type: 'number', min: (editingItem?.reservedCount || 0) + (editingItem?.servedCount || 0), message: `Must be at least ${(editingItem?.reservedCount || 0) + (editingItem?.servedCount || 0)}` }
            ]}
          >
            <InputNumber className="w-full" min={0} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MenuScheduleItemsTable;