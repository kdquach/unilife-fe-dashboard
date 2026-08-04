import { useState, useCallback } from 'react';
import menuScheduleApi from '../api/menuScheduleApi';
import { notify } from '../../../utils/notify';

const useCreateMenuSchedule = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createSchedule = useCallback(async (data) => {
    setIsSubmitting(true);
    try {
      const response = await menuScheduleApi.createMenuSchedule(data);
      if (response.success) {
        notify.success('Menu schedule created successfully', response.message);
        return response;
      } else {
        notify.error('Failed to create menu schedule', response.message);
        return response;
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'An error occurred during creation';
      notify.error('An error occurred during creation', errorMsg);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return {
    isSubmitting,
    createSchedule,
  };
};

export default useCreateMenuSchedule;
