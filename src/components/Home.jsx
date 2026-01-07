import { useEffect } from "react";
import UsageChart from "../reusable/UsageChart";
import { invoke } from "@tauri-apps/api/core";
import DailyTimelineChart from "./graphs/DailyTimelineChart";
import DailyAppUsesChart from "./graphs/DailyAppUsesChart";
import { useState } from "react";
import { getTodayDate } from "../utils/date-time/getTodayDate";

const Home = () => {
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  console.log({selectedDate})

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const app = await invoke("get_active_app");

        if (app) {
          await invoke("save_app_usage", {
            appName: app,
            seconds: 5,
          });
        }
      } catch (err) {
        console.error("Usage tracking failed:", err);
      }
    }, 5000); // 👈 every 5 seconds

    // cleanup when component unmounts
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 min-h-screen bg-zinc-900 text-white">

      <div>
        <DailyTimelineChart
          setSelectedDate={setSelectedDate}
          selectedDate={selectedDate}
        />
        <DailyAppUsesChart date={selectedDate} />
      </div>
        {/* <UsageChart /> */}
    </div>
  );
};

export default Home;
