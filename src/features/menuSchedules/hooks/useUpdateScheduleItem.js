import { useState, useCallback } from 'react';
import { App } from 'antd';
import menuScheduleItemApi from '../api/menuScheduleItemApi';

const useUpdateScheduleItem = () => {
  const { message } = App.useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateItem = useCallback(async (id, data, options = {}) => {
    setIsSubmitting(true);
    try {
      const response = await menuScheduleItemApi.updateScheduleItem(id, data);
      if (response.success) {
        message.success(response.message || 'Item updated successfully');
        if (options.onSuccess) {
          options.onSuccess(response.data);
        }
        return response;
      } else {
        message.error(response.message || 'Failed to update item');
        return response;
      }
    } catch (error) {
      // For 409, we let the component handle it with a modal. We don't show a generic toast.
      if (error.response?.status !== 409) {
        const errorMsg = error.response?.data?.message || error.message || 'An error occurred while updating the item';
        message.error(errorMsg);
      }
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [message]);

  return {
    isSubmitting,
    updateItem,
  };
};

export default useUpdateScheduleItem;
