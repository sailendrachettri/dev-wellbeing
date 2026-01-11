import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import DailyTimelineChart from "./graphs/DailyTimelineChart";
import DailyAppUsesChart from "./graphs/DailyAppUsesChart";
import { useState } from "react";
import { getTodayDate } from "../utils/date-time/getTodayDate";
import { formatSeconds } from "../utils/date-time/formatSeconds";
import { formatPrettyDate } from "../utils/date-time/formatPrettyDate";
import { formatDateShort } from "../utils/date-time/formatDateShort";
import LoadingApp from "./common/LoadingApp";
import Pomodoro from "./pomodoro/Pomodoro";
import TabDropdown from "./common/TabDropdown";

const Home = () => {
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [loading, setLoading] = useState(true);
  const [totalSecondsSpent, setTotalSecondsSpent] = useState(0);
  const [selectedTab, setSelectedTab] = useState("wellbeing");

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
    <>
      {loading ? (
        <LoadingApp />
      ) : (
        <>
        {/* Tabs */}
         <TabDropdown selectedTab={selectedTab} setSelectedTab={setSelectedTab} />

          {/* Dev Wellbeing */}
          {selectedTab == "wellbeing" && (
            <div className="min-h-screen bg-zinc-900 text-white py-5">
              <div className="flex items-center flex-col justify-center mb-6">
                <div className="text-4xl font-bold text-primary">
                  {formatSeconds(totalSecondsSpent)}
                </div>
                <div className="text-xs text-gray-500">
                  {selectedDate == getTodayDate()
                    ? "Today"
                    : formatDateShort(selectedDate)}
                </div>
              </div>

              <DailyTimelineChart
                setSelectedDate={setSelectedDate}
                selectedDate={selectedDate}
              />
              <DailyAppUsesChart
                date={selectedDate}
                setTotalSecondsSpent={setTotalSecondsSpent}
              />
            </div>
          )}

          {/* Pomodoro */}
          {selectedTab == "pomodoro" && (
            <>
              <div>
                <Pomodoro />
              </div>
            </>
          )}
        </>
      )}
    </>
  );
};

export default Home;
