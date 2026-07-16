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

  return {
    isSubmitting,
    createItem,
  };
};

export default useCreateScheduleItem;
