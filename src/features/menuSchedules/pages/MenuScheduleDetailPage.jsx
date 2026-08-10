import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Result, Space, Modal, Spin, Table } from 'antd';
import { ArrowLeftOutlined, EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { formatDate } from '../../../utils/format';
import { notify } from '../../../utils/notify';
import dayjs from 'dayjs';
import PageHeader from '../../../components/PageHeader';
import useMenuScheduleDetail from '../hooks/useMenuScheduleDetail';
import useUpdateMenuSchedule from '../hooks/useUpdateMenuSchedule';
import useCreateScheduleItem from '../hooks/useCreateScheduleItem';
import useUpdateScheduleItem from '../hooks/useUpdateScheduleItem';
import MenuScheduleDetailInfo from '../components/MenuScheduleDetailInfo';
import MenuScheduleItemsTable from '../components/MenuScheduleItemsTable';
import MenuScheduleUpdateModal from '../components/MenuScheduleUpdateModal';
import MenuScheduleItemCreateModal from '../components/MenuScheduleItemCreateModal';

const MenuScheduleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { detail, loading, error, fetchDetail, resetDetail } = useMenuScheduleDetail();
  const { updateSchedule, isSubmitting } = useUpdateMenuSchedule();
  const { createItem, createBulkItems, isSubmitting: isAddingItem } = useCreateScheduleItem();
  const { updateItem } = useUpdateScheduleItem();
  
  const [isUpdateModalOpen, setIsUpdateModalOpen] = React.useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = React.useState(false);

  useEffect(() => {
    console.log('MenuScheduleDetailPage mounted, id:', id);
    fetchDetail(id, true);
    return () => resetDetail();
  }, [id, fetchDetail, resetDetail]);

  const totalReservedCount = React.useMemo(() => {
    if (!detail || !detail.items) return 0;
    // Check if any customer has interacted with this schedule (either reserved or already served)
    return detail.items.reduce((sum, item) => sum + (item.reservedCount || 0) + (item.servedCount || 0), 0);
  }, [detail]);

  const handleUpdate = async (values) => {
    try {
      const response = await updateSchedule(id, values);
      if (response.success) {
        setIsUpdateModalOpen(false);
        fetchDetail(id, true); // Refresh data
      }
    } catch (err) {
      if (err.response?.status === 409) {
        Modal.error({
          title: 'Data Conflict',
          content: 'Data was modified by another user. Please reload the page to get the latest data.',
          okText: 'Reload',
          onOk: () => {
            setIsUpdateModalOpen(false);
            fetchDetail(id, true);
          },
        });
      }
    }
  };

  const handleAddItem = async (values) => {
    try {
      if (values.items && Array.isArray(values.items)) {
        // If only 1 item, use single API to get detailed shortage info
        if (values.items.length === 1) {
          await createItem(
            { menuScheduleId: id, ...values.items[0] },
            { onSuccess: () => { setIsAddItemModalOpen(false); fetchDetail(id, true); } }
          );
        } else {
          await createBulkItems(
            { menuScheduleId: id, items: values.items },
            { onSuccess: () => { setIsAddItemModalOpen(false); fetchDetail(id, true); } }
          );
        }
      } else {
        await createItem(
          { menuScheduleId: id, ...values },
          { onSuccess: () => { setIsAddItemModalOpen(false); fetchDetail(id, true); } }
        );
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'An error occurred while adding food items';
      const errorData = error.response?.data;
      
      // Check if this is an ingredient shortage error
      if (errorMsg.includes('Insufficient ingredient') || errorMsg.includes('Shortage') || errorData?.shortages || errorData?.ingredients) {
        // Parse the error message to extract ingredient shortage information
        const parseIngredientShortages = (message) => {
          const shortages = [];
          
          // Check if this is bulk format with "Insufficient ingredients:" prefix
          if (message.includes('Insufficient ingredients:')) {
            // Remove the prefix
            const content = message.replace('Insufficient ingredients: ', '');
            // Split by | to get food blocks (handle both single and multiple foods)
            const foodBlocks = content.split(' | ');
            
            for (const block of foodBlocks) {
              // Extract food name from the beginning
              const foodMatch = block.match(/^"([^"]+)":/);
              if (!foodMatch) continue;
              const foodName = foodMatch[1];
              
              // Remove food name prefix and get the rest
              const ingredientsContent = block.replace(/^"([^"]+)":\s*/, '');
              // Split by ; to get individual ingredients
              const ingredientItems = ingredientsContent.split('; ');
              
              for (const item of ingredientItems) {
                // Parse each ingredient: "Ingredient" - Required: X unit, Available: Y unit, Shortage: Z unit
                // Support various units: kg, piece, etc.
                const match = item.match(/"([^"]+)" - Required: ([\d.]+) (\w+), Available: ([\d.]+) (\w+), Shortage: ([\d.]+) (\w+)/);
                if (match) {
                  shortages.push({
                    food: foodName,
                    ingredient: match[1],
                    required: match[2],
                    available: match[4],
                    shortage: match[6],
                    unit: match[3], // Store unit for display
                  });
                }
              }
            }
            
            return shortages;
          }
          
          // Check if this is single food format with "Insufficient ingredients for food" prefix
          if (message.includes('Insufficient ingredients for food')) {
            const foodMatch = message.match(/Insufficient ingredients for food "([^"]+)":/);
            if (foodMatch) {
              const foodName = foodMatch[1];
              const content = message.replace(/Insufficient ingredients for food "[^"]+":\s*/, '');
              const ingredientItems = content.split('; ');
              
              for (const item of ingredientItems) {
                const match = item.match(/"([^"]+)" - Required: ([\d.]+) (\w+), Available: ([\d.]+) (\w+), Shortage: ([\d.]+) (\w+)/);
                if (match) {
                  shortages.push({
                    food: foodName,
                    ingredient: match[1],
                    required: match[2],
                    available: match[4],
                    shortage: match[6],
                    unit: match[3],
                  });
                }
              }
            }
            
            return shortages;
          }
          
          // Try multiple regex patterns to handle different backend response formats
          const patterns = [
            // Pattern 1: Single food format - Insufficient ingredients for food "X": "Y" - Required: A kg, Available: B kg, Shortage: C kg
            {
              regex: /Insufficient ingredients for food "([^"]+)":\s*"([^"]+)" - Required: ([\d.]+) kg, Available: ([\d.]+) kg, Shortage: ([\d.]+) kg/g,
              parseMatch: (match) => ({
                ingredient: match[2],
                food: match[1],
                required: match[3],
                available: match[4],
                shortage: match[5],
              }),
            },
            // Pattern 2: Old format - Insufficient ingredient "X" for food "Y". Required: A kg, Available in stock: B kg (Shortage: C kg)
            {
              regex: /Insufficient ingredient "([^"]+)" for food "([^"]+)". Required: ([\d.]+) kg, Available in stock: ([\d.]+) kg \(Shortage: ([\d.]+) kg\)/g,
              parseMatch: (match) => ({
                ingredient: match[1],
                food: match[2],
                required: match[3],
                available: match[4],
                shortage: match[5],
              }),
            },
            // Pattern 3: Simple format
            {
              regex: /Insufficient ingredient "([^"]+)" for food "([^"]+)". Required: ([\d.]+) kg, Available: ([\d.]+) kg, Shortage: ([\d.]+) kg/g,
              parseMatch: (match) => ({
                ingredient: match[1],
                food: match[2],
                required: match[3],
                available: match[4],
                shortage: match[5],
              }),
            },
            // Pattern 4: Alternative format
            {
              regex: /"([^"]+)" insufficient for "([^"]+)". Required: ([\d.]+) kg, Available: ([\d.]+) kg \(Shortage: ([\d.]+) kg\)/g,
              parseMatch: (match) => ({
                ingredient: match[1],
                food: match[2],
                required: match[3],
                available: match[4],
                shortage: match[5],
              }),
            },
          ];
          
          for (const { regex, parseMatch } of patterns) {
            let match;
            while ((match = regex.exec(message)) !== null) {
              const shortage = parseMatch(match);
              shortages.push(shortage);
            }
          }
          
          return shortages;
        };

        let shortages = parseIngredientShortages(errorMsg);
        
        // Also check if backend sent structured data
        if (errorData?.shortages && Array.isArray(errorData.shortages)) {
          shortages = errorData.shortages;
        } else if (errorData?.ingredients && Array.isArray(errorData.ingredients)) {
          shortages = errorData.ingredients;
        }

        const columns = [
          {
            title: '#',
            key: 'index',
            width: 50,
            align: 'center',
            render: (_text, _record, index) => index + 1,
          },
          {
            title: 'Ingredient',
            dataIndex: 'ingredient',
            key: 'ingredient',
            render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
          },
          {
            title: 'Food',
            dataIndex: 'food',
            key: 'food',
          },
          {
            title: 'Required',
            dataIndex: 'required',
            key: 'required',
            align: 'right',
            render: (text, record) => `${text} ${record.unit || 'kg'}`,
          },
          {
            title: 'Available',
            dataIndex: 'available',
            key: 'available',
            align: 'right',
            render: (text, record) => <span style={{ color: text === '0' ? '#ff4d4f' : 'inherit' }}>{text} {record.unit || 'kg'}</span>,
          },
          {
            title: 'Shortage',
            dataIndex: 'shortage',
            key: 'shortage',
            align: 'right',
            render: (text, record) => <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>{text} {record.unit || 'kg'}</span>,
          },
        ];

        Modal.error({
          title: 'Insufficient Ingredients',
          icon: <ExclamationCircleOutlined />,
          width: 800,
          closable: true,
          content: (
            <div>
              <p style={{ marginBottom: 16 }}>
                The following ingredients are insufficient in stock to add the food item(s):
              </p>
              {shortages.length > 0 ? (
                <Table
                  dataSource={shortages}
                  columns={columns}
                  rowKey={(record) => `${record.ingredient}-${record.food}`}
                  pagination={false}
                  size="small"
                  bordered
                  style={{ marginBottom: 16 }}
                />
              ) : (
                <p style={{ color: '#ff4d4f', marginBottom: 16 }}>
                  Unable to parse ingredient shortage details. Error: {errorMsg}
                </p>
              )}
              <p style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                Please add more ingredients to stock before adding this food item.
              </p>
            </div>
          ),
          okText: 'Go to Ingredient Management',
          cancelText: 'Close',
          onOk: () => {
            navigate('/ingredients');
          },
          onCancel: () => {
            // Do nothing, just close the modal
          },
        });
      } else {
        notify.error('An error occurred while adding food items', errorMsg);
      }
    }
  };

  const handleUpdateItem = async (itemId, payload) => {
    try {
      await updateItem(itemId, payload, { onSuccess: () => fetchDetail(id, true) });
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'An error occurred while updating food item';
      const errorData = err.response?.data;
      
      if (err.response?.status === 409) {
        Modal.error({
          title: 'Data Conflict',
          content: 'Data was modified by another user. Please reload the page to get the latest data.',
          okText: 'Reload',
          onOk: () => fetchDetail(id, true),
        });
      } else if (errorMsg.includes('Insufficient ingredient') || errorMsg.includes('Shortage') || errorData?.shortages || errorData?.ingredients) {
        // Handle ingredient shortage error - same logic as handleAddItem
        const parseIngredientShortages = (message) => {
          const shortages = [];
          
          // Check if this is bulk format with "Insufficient ingredients:" prefix
          if (message.includes('Insufficient ingredients:')) {
            const content = message.replace('Insufficient ingredients: ', '');
            const foodBlocks = content.split(' | ');
            
            for (const block of foodBlocks) {
              const foodMatch = block.match(/^"([^"]+)":/);
              if (!foodMatch) continue;
              const foodName = foodMatch[1];
              
              const ingredientsContent = block.replace(/^"([^"]+)":\s*/, '');
              const ingredientItems = ingredientsContent.split('; ');
              
              for (const item of ingredientItems) {
                const match = item.match(/"([^"]+)" - Required: ([\d.]+) kg, Available: ([\d.]+) kg, Shortage: ([\d.]+) kg/);
                if (match) {
                  shortages.push({
                    food: foodName,
                    ingredient: match[1],
                    required: match[2],
                    available: match[3],
                    shortage: match[4],
                  });
                }
              }
            }
            
            return shortages;
          }
          
          // Handle single ingredient format (including "Required increase")
          const patterns = [
            {
              regex: /Insufficient ingredient "([^"]+)" for food "([^"]+)". Required increase: ([\d.]+) (\w+), Available in stock: ([\d.]+) (\w+) \(Shortage: ([\d.]+) (\w+)\)/g,
              parseMatch: (match) => ({
                ingredient: match[1],
                food: match[2],
                required: match[3],
                available: match[4],
                shortage: match[6],
                unit: match[4],
              }),
            },
            {
              regex: /Insufficient ingredient "([^"]+)" for food "([^"]+)". Required: ([\d.]+) (\w+), Available in stock: ([\d.]+) (\w+) \(Shortage: ([\d.]+) (\w+)\)/g,
              parseMatch: (match) => ({
                ingredient: match[1],
                food: match[2],
                required: match[3],
                available: match[4],
                shortage: match[6],
                unit: match[4],
              }),
            },
            {
              regex: /Insufficient ingredients for food "([^"]+)":\s*"([^"]+)" - Required: ([\d.]+) (\w+), Available: ([\d.]+) (\w+), Shortage: ([\d.]+) (\w+)/g,
              parseMatch: (match) => ({
                ingredient: match[2],
                food: match[1],
                required: match[3],
                available: match[4],
                shortage: match[6],
                unit: match[4],
              }),
            },
          ];
          
          for (const { regex, parseMatch } of patterns) {
            let match;
            while ((match = regex.exec(message)) !== null) {
              const shortage = parseMatch(match);
              shortages.push(shortage);
            }
          }
          
          return shortages;
        };
        
        let shortages = parseIngredientShortages(errorMsg);
        
        if (errorData?.shortages && Array.isArray(errorData.shortages)) {
          shortages = errorData.shortages;
        } else if (errorData?.ingredients && Array.isArray(errorData.ingredients)) {
          shortages = errorData.ingredients;
        }

        const columns = [
          {
            title: '#',
            key: 'index',
            width: 50,
            align: 'center',
            render: (_text, _record, index) => index + 1,
          },
          {
            title: 'Ingredient',
            dataIndex: 'ingredient',
            key: 'ingredient',
            render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
          },
          {
            title: 'Food',
            dataIndex: 'food',
            key: 'food',
          },
          {
            title: 'Required',
            dataIndex: 'required',
            key: 'required',
            align: 'right',
            render: (text, record) => `${text} ${record.unit || 'kg'}`,
          },
          {
            title: 'Available',
            dataIndex: 'available',
            key: 'available',
            align: 'right',
            render: (text, record) => <span style={{ color: text === '0' ? '#ff4d4f' : 'inherit' }}>{text} {record.unit || 'kg'}</span>,
          },
          {
            title: 'Shortage',
            dataIndex: 'shortage',
            key: 'shortage',
            align: 'right',
            render: (text, record) => <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>{text} {record.unit || 'kg'}</span>,
          },
        ];

        Modal.error({
          title: 'Insufficient Ingredients',
          icon: <ExclamationCircleOutlined />,
          width: 800,
          closable: true,
          content: (
            <div>
              <p style={{ marginBottom: 16 }}>
                The following ingredients are insufficient in stock to update the food item:
              </p>
              {shortages.length > 0 ? (
                <Table
                  dataSource={shortages}
                  columns={columns}
                  rowKey={(record) => `${record.ingredient}-${record.food}`}
                  pagination={false}
                  size="small"
                  bordered
                  style={{ marginBottom: 16 }}
                />
              ) : (
                <p style={{ color: '#ff4d4f', marginBottom: 16 }}>
                  Unable to parse ingredient shortage details. Error: {errorMsg}
                </p>
              )}
              <p style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                Please add more ingredients to stock before updating this food item.
              </p>
            </div>
          ),
          okText: 'Go to Ingredient Management',
          cancelText: 'Close',
          onOk: () => {
            navigate('/ingredients');
          },
          onCancel: () => {
            // Do nothing, just close the modal
          },
        });
      } else {
        notify.error('An error occurred while updating food item', errorMsg);
      }
    }
  };
  
  const handleToggleActiveItem = (itemId, isActive, __v) => {
    if (!isActive) {
      const scheduleDate = dayjs(detail.date).startOf('day');
      const today = dayjs().startOf('day');
      const isFuture = scheduleDate.isAfter(today);
      
      Modal.confirm({
        title: 'Deactivate Food Item',
        content: isFuture 
          ? 'This menu schedule is in the future. Deactivating this item will refund its reserved ingredients back to the inventory. Are you sure you want to proceed?'
          : 'This menu schedule is for today or the past. Deactivating this item will hide it from students, but the ingredients will NOT be refunded to the inventory (considered consumed/wasted). Are you sure you want to proceed?',
        okText: 'Yes, Deactivate',
        okType: 'danger',
        cancelText: 'Cancel',
        onOk: () => {
          handleUpdateItem(itemId, { isActive, __v });
        }
      });
    } else {
      handleUpdateItem(itemId, { isActive, __v });
    }
  };

  const isTerminalState = detail?.status === 'CANCELLED' || detail?.status === 'COMPLETED';

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

  const extraActions = !loading && detail && !isTerminalState ? (
    <Button 
      type="primary" 
      icon={<EditOutlined />} 
      onClick={() => setIsUpdateModalOpen(true)}
      className="bg-blue-600 hover:bg-blue-700"
    >
      Edit Schedule
    </Button>
  ) : null;

  if (error) {
    return (
      <div>
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

  if (loading && !detail) {
    return (
      <div>
        <PageHeader 
          title={backButtonTitle}
        />
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title={backButtonTitle}
        breadcrumbs={["Dashboard", "Menu Schedules", "Detail"]}
        description={detail ? `Schedule Date: ${formatDate(detail.date)}` : "Loading..."}
        extra={extraActions}
      />

      <div data-testid="detail-content" className="flex flex-col gap-6">
        <MenuScheduleDetailInfo detail={detail} loading={loading} />
        <MenuScheduleItemsTable 
          items={detail?.items} 
          loading={loading}
          isReadOnly={isTerminalState}
          onUpdateItem={handleUpdateItem}
          onToggleActive={handleToggleActiveItem}
          onOpenAddModal={() => setIsAddItemModalOpen(true)}
        />
      </div>

      <MenuScheduleUpdateModal
        open={isUpdateModalOpen}
        onCancel={() => setIsUpdateModalOpen(false)}
        onUpdate={handleUpdate}
        isSubmitting={isSubmitting}
        initialData={detail}
        totalReservedCount={totalReservedCount}
      />

      <MenuScheduleItemCreateModal
        open={isAddItemModalOpen}
        onCancel={() => setIsAddItemModalOpen(false)}
        onCreate={handleAddItem}
        isSubmitting={isAddingItem}
        existingFoodIds={detail?.items?.map(item => item.foodId?._id || item.foodId) || []}
      />
    </div>
  );
};

export default MenuScheduleDetailPage;
