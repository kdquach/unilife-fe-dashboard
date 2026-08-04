import { useState, useCallback } from 'react';
import menuScheduleApi from '../api/menuScheduleApi';
import { notify } from '../../../utils/notify';

const useUpdateMenuSchedule = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateSchedule = useCallback(async (id, data) => {
    setIsSubmitting(true);
    try {
      const response = await menuScheduleApi.updateMenuSchedule(id, data);
      if (response.success) {
        notify.success('Menu schedule updated successfully', response.message);
        return response;
      } else {
        notify.error('Failed to update menu schedule', response.message);
        return response;
      }
    } catch (error) {
      // Don't show toast for 409, let the component handle it with a modal
      if (error.response?.status !== 409) {
        const errorMsg = error.response?.data?.message || error.message || 'An error occurred during update';
        notify.error('An error occurred during update', errorMsg);
      }
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return {
    isSubmitting,
    updateSchedule,
  };
};

export default useUpdateMenuSchedule;
