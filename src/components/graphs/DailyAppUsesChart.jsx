import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { formatAppName } from "../../utils/string-formate/formatAppName";
import { formatSeconds } from "../../utils/date-time/formatSeconds";

export const colors = [
  // Original
  "from-emerald-500 to-teal-500",
  "from-purple-500 to-pink-500",
  "from-pink-500 to-cyan-500",
  "from-orange-500 to-red-500",
  "from-yellow-500 to-amber-500",

  // Blues & Cyans
  "from-blue-500 to-cyan-500",
  "from-sky-500 to-blue-600",
  "from-cyan-500 to-teal-600",
  "from-indigo-500 to-blue-500",

  // Purples & Pinks
  "from-fuchsia-500 to-purple-600",
  "from-violet-500 to-fuchsia-500",
  "from-rose-500 to-pink-600",
  "from-pink-500 to-rose-500",

  // Greens & Limes
  "from-green-500 to-lime-500",
  "from-lime-500 to-emerald-500",
  "from-teal-500 to-green-600",

  // Warm / Sunset
  "from-amber-500 to-orange-500",
  "from-red-500 to-rose-600",
  "from-orange-500 to-pink-500",

  // Dark / Moody (great for focus apps)
  "from-slate-700 to-slate-900",
];


const DailyAppUsesChart = ({ date, setTotalSecondsSpent }) => {
  const [apps, setApps] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [icons, setIcons] = useState({});

  const sortedApps = [...apps].sort((a, b) => b.seconds - a.seconds);

  useEffect(() => {
    if (!apps || apps.length === 0) return;

    apps.forEach(async (app) => {
      if (!app?.app) return;
      try {
        const icon = await invoke("get_app_icon", { appPath: app.app });
        setIcons((prev) => ({ ...prev, [app.app]: icon }));
      } catch (err) {
        console.error("Failed to get icon for", app.app, err);
      }
    });
  }, [apps]);

  useEffect(() => {
    if (!date) return;

    let isMounted = true;

    invoke("get_usage_by_date", { date })
      .then((data) => {
        if (isMounted) setApps(data);
      })
      .catch(console.error);

    const interval = setInterval(() => {
      invoke("get_usage_by_date", { date })
        .then((data) => {
          if (isMounted) setApps(data);
        })
        .catch(console.error);
    }, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [date]);

  const totalSeconds = apps.reduce((acc, a) => acc + a.seconds, 0) || 1;
  setTotalSecondsSpent(totalSeconds);

  return (
    <div className="bg-zinc-900 mx-2 mt-16 rounded-2xl p-6 border-dark">
      {/* <img src={icon} className="w-8 h-8" /> */}
      {apps.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-3">📊</div>
          <p className="text-gray-400">No usage recorded</p>
        </div>
      ) : (
        <>
          <div className="space-y-4 ">
            {sortedApps?.map((app, idx) => {
              const percent = Math.round((app?.seconds / totalSeconds) * 100);
              const isHidden = idx >= 5 && !showAll;
              const marginBottom = !isHidden && idx < 4 ? "mb-4" : "";

              return (
                <div
                  key={app?.app}
                  className={`transition-all duration-500 ease-in-out overflow-hidden ${marginBottom}
          ${
            isHidden
              ? "max-h-0 opacity-0 scale-[0.98]"
              : "max-h-30 opacity-100 scale-100"
          }
        `}
                >
                  <div className="bg-dark/50 backdrop-blur rounded-xl p-4 hover:bg-dark/70 transition-all duration-300 border border-zinc-700/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {icons[app?.app] ? (
                            <img
                              src={icons[app.app]}
                              alt={app.app}
                              className="w-8 h-8"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-zinc-700 rounded-full" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-white">
                            {formatAppName(app?.app)}
                          </div>
                          <div className="text-xs text-gray-400">
                            {formatSeconds(app?.seconds)} • {percent}% of total
                          </div>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-primary">
                        {formatSeconds(app?.seconds)}
                      </div>
                    </div>

                    <div className="relative h-2 bg-zinc-700/50 rounded-full overflow-hidden">
                      <div
                        className={`absolute inset-y-0 left-0 bg-linear-to-r ${
                          colors[idx % colors.length]
                        } rounded-full transition-all duration-700`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {sortedApps.length > 5 && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="mt-4 w-full text-sm text-primary transition cursor-pointer"
            >
              {showAll
                ? "Show less"
                : `Show ${sortedApps.length - 5} more apps`}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default DailyAppUsesChart;
