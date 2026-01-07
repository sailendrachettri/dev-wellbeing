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
      {/* <div className="text-2xl flex items-center justify-start gap-x-2 flex-nowrap font-bold text-emerald-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
          />
        </svg>
        <span> Dev Wellbeing</span>
      </div> */}

      <div>
        <DailyTimelineChart
          setSelectedDate={setSelectedDate}
          selectedDate={selectedDate}
        />
        <DailyAppUsesChart date={selectedDate} />
        {/* <UsageChart /> */}
      </div>
    </div>
  );
};

export default Home;
