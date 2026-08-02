import { useState } from "react";
import { queueService } from "../../queues/queueService";
import { notify } from "../../../utils/notify";

/**
 * Hook to manage kitchen queue
 */
export function useKitchenQueue() {
  const [currentServing, setCurrentServing] = useState(null);
  const [waitingQueues, setWaitingQueues] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(false);
  const [callingNext, setCallingNext] = useState(false);
  
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchMonitorQueue = async (
    page = pagination.current,
    limit = pagination.pageSize,
    searchKeyword = "",
    filters = {},
  ) => {
    try {
      setLoading(true);

      const response = await queueService.getMonitorQueue({
        page,
        limit,
        keyword: searchKeyword || undefined,
        ...filters,
      });

      setCurrentServing(response.currentServing || null);
      setWaitingQueues(response.waiting || []);
      setSummary(response.summary || {});
      setPagination({
        current: response.pagination.page,
        pageSize: response.pagination.limit,
        total: response.pagination.total,
      });
    } catch (error) {
      notify.error("Queue Load Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  const callNextQueue = async () => {
    try {
      setCallingNext(true);
      await queueService.callNextNumber();
      notify.success("Next queue called successfully");
      await fetchMonitorQueue(pagination.current, pagination.pageSize);
    } catch (error) {
      notify.error("Failed to call next queue", error.message);
    } finally {
      setCallingNext(false);
    }
  };

  return {
    currentServing,
    waitingQueues,
    summary,
    loading,
    callingNext,
    pagination,
    fetchMonitorQueue,
    callNextQueue,
  };
}
