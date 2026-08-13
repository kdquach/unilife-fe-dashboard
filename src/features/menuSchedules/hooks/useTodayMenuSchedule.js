import { useCallback, useState } from "react";
import menuScheduleApi from "../api/menuScheduleApi";
import { notify } from "../../../utils/notify";


const useTodayMenuSchedule = () => {

  const [todayMenu, setTodayMenu] = useState(null);
  const [loading, setLoading] = useState(false);


  const fetchTodayMenu = useCallback(async () => {

    setLoading(true);

    try {

      const response =
        await menuScheduleApi.getTodayMenuSchedule();


      if (response.success) {
        setTodayMenu(response.data);
      }


      return response;


    } catch (error) {

      notify.error(
        "Cannot load today's menu",
        error.response?.data?.message
      );


      throw error;


    } finally {

      setLoading(false);

    }

  }, []);


  return {
    todayMenu,
    loading,
    fetchTodayMenu,
  };
};


export default useTodayMenuSchedule;