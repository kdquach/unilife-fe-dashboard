import { useState, useCallback } from 'react';
import { App } from 'antd';
import menuScheduleApi from '../api/menuScheduleApi';

const useCreateMenuSchedule = () => {
  const { message } = App.useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createSchedule = useCallback(async (data) => {
    setIsSubmitting(true);
    try {
      const response = await menuScheduleApi.createMenuSchedule(data);
      if (response.success) {
        message.success(response.message || 'Menu schedule created successfully');
        return response;
      } else {
        message.error(response.message || 'Failed to create menu schedule');
        return response;
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'An error occurred during creation';
      message.error(errorMsg);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [message]);

  return {
    isSubmitting,
    createSchedule,
  };
};

export default useCreateMenuSchedule;
