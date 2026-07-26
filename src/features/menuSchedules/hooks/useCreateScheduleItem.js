import { useState, useCallback } from 'react';
import { App } from 'antd';
import menuScheduleItemApi from '../api/menuScheduleItemApi';

const useCreateScheduleItem = () => {
  const { message } = App.useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createItem = useCallback(async (data, options = {}) => {
    setIsSubmitting(true);
    try {
      const response = await menuScheduleItemApi.createScheduleItem(data);
      if (response.success) {
        message.success(response.message || 'Item added successfully');
        if (options.onSuccess) {
          options.onSuccess(response.data);
        }
        return response;
      } else {
        message.error(response.message || 'Failed to add item');
        return response;
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'An error occurred while adding the item';
      message.error(errorMsg);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [message]);

  const createBulkItems = useCallback(async (data, options = {}) => {
    setIsSubmitting(true);
    try {
      const response = await menuScheduleItemApi.createBulkScheduleItems(data);
      if (response.success) {
        const count = Array.isArray(response.data) ? response.data.length : '';
        message.success(response.message || `Successfully added ${count} food item(s) to schedule`);
        if (options.onSuccess) {
          options.onSuccess(response.data);
        }
        return response;
      } else {
        message.error(response.message || 'Failed to add food items');
        return response;
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'An error occurred while adding food items';
      message.error(errorMsg);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [message]);

  return {
    isSubmitting,
    createItem,
    createBulkItems,
  };
};

export default useCreateScheduleItem;
