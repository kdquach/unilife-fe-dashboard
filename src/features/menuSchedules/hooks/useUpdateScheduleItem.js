import { useState, useCallback } from 'react';
import menuScheduleItemApi from '../api/menuScheduleItemApi';
import { notify } from '../../../utils/notify';

const useUpdateScheduleItem = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateItem = useCallback(async (id, data, options = {}) => {
    setIsSubmitting(true);
    try {
      const response = await menuScheduleItemApi.updateScheduleItem(id, data);
      if (response.success) {
        notify.success('Item updated successfully', response.message);
        if (options.onSuccess) {
          options.onSuccess(response.data);
        }
        return response;
      } else {
        notify.error('Failed to update item', response.message);
        return response;
      }
    } catch (error) {
      // For 409, we let the component handle it with a modal. We don't show a generic toast.
      if (error.response?.status !== 409) {
        const errorMsg = error.response?.data?.message || error.message || 'An error occurred while updating the item';
        notify.error('An error occurred while updating the item', errorMsg);
      }
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return {
    isSubmitting,
    updateItem,
  };
};

export default useUpdateScheduleItem;
