import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { formatAppName } from "../../utils/string-formate/formatAppName";
import { formatSeconds } from "../../utils/date-time/formatSeconds";

const DailyAppUsesChart = ({ date }) => {
  const [apps, setApps] = useState([]);
  useEffect(() => {
    if (!date) return;

    invoke("get_usage_by_date", { date })
      .then(setApps)
      .catch(console.error);
  }, [date]);

  const totalSeconds = apps.reduce((acc, a) => acc + a.seconds, 0) || 1;

  return (
    <div className="bg-zinc-900 rounded-lg p-4 mt-6">
      <h3 className="text-lg font-semibold text-emerald-400 mb-4">
        📱 App usage on {date}
      </h3>

      {apps.length === 0 ? (
        <p className="text-gray-400">No usage recorded</p>
      ) : (
        <ul className="space-y-3">
          {apps.map((app) => {
            const percent = Math.round((app.seconds / totalSeconds) * 100);

            return (
              <li key={app.app} className="space-y-1">
                {/* Header */}
                <div className="flex justify-between text-sm">
                  <span className="font-medium">
                    {formatAppName(app.app)}
                  </span>
                  <span className="text-gray-400">
                    {formatSeconds(app.seconds)}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default DailyAppUsesChart;
