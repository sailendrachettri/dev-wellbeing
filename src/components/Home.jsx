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
import ContextSwitchPanel from "./contex-switching/ContextSwitchPanel";

const Home = () => {
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [loading, setLoading] = useState(true);
  const [totalSecondsSpent, setTotalSecondsSpent] = useState(0);
  const [selectedTab, setSelectedTab] = useState("wellbeing");

  setTimeout(() => {
    setLoading(false);
  }, 700);

  return (
    <>
      {loading ? (
        <LoadingApp />
      ) : (
        <>
          {/* Tabs */}
          <TabDropdown
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
          />

          {/* Dev Wellbeing */}
          {selectedTab == "wellbeing" && (
            <div className="min-h-screen bg-dark text-white py-5">
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

          {/* Contex Switching */}
          {selectedTab == "context-switches" && <ContextSwitchPanel />}
        </>
      )}
    </>
  );
};

export default Home;
