import { useEffect, useState, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { formatSeconds } from "../utils/date-time/formatSeconds";

const DailyUsesView = () => {
  const [usage, setUsage] = useState([]);

  const lastApp = useRef(null);
  const lastTime = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(async () => {
      const app = await invoke("get_active_app");
      const now = Date.now();

      if (lastApp.current) {
        const diff = Math.floor((now - lastTime.current) / 1000);

        await invoke("save_app_usage", {
          appName: lastApp.current,
          seconds: diff,
        });
      }

      lastApp.current = app;
      lastTime.current = now;

      const data = await invoke("get_usage_today");
      setUsage(data);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Helper to clean app name
  const cleanAppName = (name) => {
    if (!name) return "";
    return name.replace(/\.exe$/i, "");
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-6 flex flex-col">
    

      {usage.length === 0 ? (
        <p className="text-gray-400">No usage data yet...</p>
      ) : (
        <ul className="space-y-3">
          {usage.map((u, idx) => {
            const appName = cleanAppName(u.app);
            const percentage =
              u.seconds /
              usage.reduce((acc, cur) => acc + cur.seconds, 0 || 1); // prevent div by 0

            return (
              <li
                key={u.app + idx}
                className="bg-zinc-800 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-zinc-700 transition"
              >
                {/* App Name */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-2 w-full md:w-1/2">
                  <span className="font-semibold text-lg capitalize truncate">
                    {appName}
                  </span>
                  <span className="text-gray-400 text-sm">
                    {formatSeconds(u.seconds)}
                  </span>
                </div>

                {/* Usage Bar */}
                <div className="w-full md:w-1/2 mt-2 md:mt-0 h-4 bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 transition-all"
                    style={{ width: `${Math.floor(percentage * 100)}%` }}
                  ></div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default DailyUsesView;
