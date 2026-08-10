import { useState, useCallback } from 'react';
import menuScheduleItemApi from '../api/menuScheduleItemApi';
import { notify } from '../../../utils/notify';

const useCreateScheduleItem = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createItem = useCallback(async (data, options = {}) => {
    setIsSubmitting(true);
    try {
      const response = await menuScheduleItemApi.createScheduleItem(data);
      if (response.success) {
        notify.success('Item added successfully', response.message);
        if (options.onSuccess) {
          options.onSuccess(response.data);
        }
        return response;
      } else {
        notify.error('Failed to add item', response.message);
        return response;
      }
    } catch (error) {
      // Log error for debugging but let calling component handle the display
      console.error('Error in createItem:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const createBulkItems = useCallback(async (data, options = {}) => {
    setIsSubmitting(true);
    try {
      const response = await menuScheduleItemApi.createBulkScheduleItems(data);
      if (response.success) {
        const count = Array.isArray(response.data) ? response.data.length : '';
        notify.success(`Successfully added ${count} food item(s) to schedule`, response.message);
        if (options.onSuccess) {
          options.onSuccess(response.data);
        }
        return response;
      } else {
        notify.error('Failed to add food items', response.message);
        return response;
      }
    } catch (error) {
      // Log error for debugging but let calling component handle the display
      console.error('Error in createBulkItems:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return {
    isSubmitting,
    createItem,
    createBulkItems,
  };
};

export default useCreateScheduleItem;
