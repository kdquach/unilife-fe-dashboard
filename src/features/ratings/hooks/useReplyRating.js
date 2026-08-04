import { useState } from 'react';
import ratingApi from '../api/ratingApi';
import { notify } from '../../../utils/notify';

const useReplyRating = () => {
  const [loading, setLoading] = useState(false);

  const submitReply = async (id, staffReply, onSuccess) => {
    if (!staffReply || !staffReply.trim()) {
      notify.error('Reply content cannot be empty');
      return false;
    }

    setLoading(true);
    try {
      await ratingApi.replyRating(id, { staffReply: staffReply.trim() });
      notify.success('Replied successfully');
      if (onSuccess) {
        onSuccess();
      }
      return true;
    } catch (err) {
      console.error('Failed to reply rating:', err);
      let errorMsg = 'An error occurred while replying';
      if (err instanceof Error) {
        errorMsg = err.message;
      }
      notify.error('An error occurred while replying', errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    submitReply,
  };
};

export default useReplyRating;
