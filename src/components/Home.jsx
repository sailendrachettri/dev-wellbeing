import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import DailyTimelineChart from "./graphs/DailyTimelineChart";
import DailyAppUsesChart from "./graphs/DailyAppUsesChart";
import { useState } from "react";
import { getTodayDate } from "../utils/date-time/getTodayDate";

const Home = () => {
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    }, 10000); 

    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 min-h-screen bg-zinc-900 text-white">
      {loading ? (
        <div className="min-h-screen overflow-hidden flex items-center justify-center">
          <div className="flex items-center justify-center flex-col gap-y-2">
            <div className="loader"></div>
            <small className="text-slate-500 italic">Getting your stats… just a moment!</small>
          </div>
        </div>
      ) : (
        <div>
          <DailyTimelineChart
            setSelectedDate={setSelectedDate}
            selectedDate={selectedDate}
          />
          <DailyAppUsesChart date={selectedDate} />
        </div>
      )}
    </div>
  );
};

export default Home;
