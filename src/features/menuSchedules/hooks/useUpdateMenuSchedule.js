import { useState, useCallback } from 'react';
import { App } from 'antd';
import menuScheduleApi from '../api/menuScheduleApi';

const useUpdateMenuSchedule = () => {
  const { message } = App.useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateSchedule = useCallback(async (id, data) => {
    setIsSubmitting(true);
    try {
      const response = await menuScheduleApi.updateMenuSchedule(id, data);
      if (response.success) {
        message.success(response.message || 'Menu schedule updated successfully');
        return response;
      } else {
        message.error(response.message || 'Failed to update menu schedule');
        return response;
      }
    } catch (error) {
      // Don't show toast for 409, let the component handle it with a modal
      if (error.response?.status !== 409) {
        const errorMsg = error.response?.data?.message || error.message || 'An error occurred during update';
        message.error(errorMsg);
      }
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [message]);

  return {
    isSubmitting,
    updateSchedule,
  };
};

export default useUpdateMenuSchedule;
