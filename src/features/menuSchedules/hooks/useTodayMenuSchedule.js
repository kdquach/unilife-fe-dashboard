import { useCallback, useState } from "react";
import { App } from "antd";
import menuScheduleApi from "../api/menuScheduleApi";


const useTodayMenuSchedule = () => {

  const { message } = App.useApp();

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

      message.error(
        error.response?.data?.message ||
        "Cannot load today's menu"
      );


      throw error;


    } finally {

      setLoading(false);

    }

  }, [message]);


  return {
    todayMenu,
    loading,
    fetchTodayMenu,
  };
};


export default useTodayMenuSchedule;