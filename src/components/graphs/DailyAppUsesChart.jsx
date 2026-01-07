import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { formatAppName } from "../../utils/string-formate/formatAppName";
import { formatSeconds } from "../../utils/date-time/formatSeconds";
import { getAppIcon } from "../../utils/icons/appIcon";
import { formatPrettyDate } from "../../utils/date-time/formatPrettyDate";

const colors = [
  "from-emerald-500 to-teal-500",
  "from-blue-500 to-cyan-500",
  "from-purple-500 to-pink-500",
  "from-orange-500 to-red-500",
  "from-yellow-500 to-amber-500",
];

const DailyAppUsesChart = ({ date }) => {
  const [apps, setApps] = useState([]);

  useEffect(() => {
    if (!date) return;

    invoke("get_usage_by_date", { date })
      .then(setApps)
      .catch(console.error);
  }, [date]);

  const totalSeconds = apps.reduce((acc, a) => acc + a.seconds, 0) || 1;
  const totalHours = (totalSeconds / 3600).toFixed(1);

  return (
    <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 rounded-2xl p-6 mt-6 shadow-2xl border border-zinc-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">
            App Usage
          </h3>
          <p className="text-sm text-gray-400">{formatPrettyDate(date)}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-emerald-400">{totalHours}h</div>
          <div className="text-xs text-gray-500">total time</div>
        </div>
      </div>

      {apps.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-3">📊</div>
          <p className="text-gray-400">No usage recorded</p>
        </div>
      ) : (
        <div className="space-y-4">
          {apps?.map((app, idx) => {
            const percent = Math.round((app.seconds / totalSeconds) * 100);
            const hours = (app.seconds / 3600).toFixed(1);

            return (
              <div
                key={app.app}
                className="bg-zinc-800/50 backdrop-blur rounded-xl p-4 hover:bg-zinc-800/70 transition-all duration-300 border border-zinc-700/50"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{getAppIcon(app.app)}</div>
                    <div>
                      <div className="font-semibold text-white">
                        {formatAppName(app.app)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatSeconds(app.seconds)} • {percent}% of total
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-emerald-400">
                      {hours}h
                    </div>
                  </div>
                </div>

                {/* Modern Progress Bar */}
                <div className="relative h-2 bg-zinc-700/50 rounded-full overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 bg-gradient-to-r ${colors[idx % colors.length]} rounded-full transition-all duration-700 ease-out shadow-lg`}
                    style={{ width: `${percent}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DailyAppUsesChart;