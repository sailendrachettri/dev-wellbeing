import { useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { formatSeconds } from "../../utils/date-time/formatSeconds";
import { formatAppName } from "../../utils/string-formate/formatAppName";
import { TiFlowSwitch } from "react-icons/ti";
import { getTopTransition } from "../../utils/matix/getTopTransition";
import Metric from "../../utils/matix/Metric";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { formatPrettyDate } from "../../utils/date-time/formatPrettyDate";

const getToday = () => new Date().toISOString().slice(0, 10);

const addDays = (dateStr, days) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const isToday = (dateStr) => dateStr === getToday();

const MAX_VISIBLE = 5;

export default function ContextSwitchPanel() {
  const [switches, setSwitches] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getToday);

  const handlePrevDay = () => {
    setSelectedDate((d) => addDays(d, -1));
  };

  const handleNextDay = () => {
    if (isToday(selectedDate)) return; // no future
    setSelectedDate((d) => addDays(d, 1));
  };

  useEffect(() => {
    if (!selectedDate) return;

    invoke("get_context_switches_by_date", { date: selectedDate })
      .then(setSwitches)
      .catch(console.error);
  }, [selectedDate]);

  const total = switches.length;
  const hoursPassed = Math.max(1, new Date().getHours());
  const perHour = (total / hoursPassed).toFixed(1);

  const topTransition = useMemo(() => getTopTransition(switches), [switches]);

  const visibleSwitches = showAll ? switches : switches.slice(0, MAX_VISIBLE);

  return (
    <>
      <div className="bg-zinc-900 border min-h-[70vh] border-zinc-800 rounded-xl p-5 space-y-4 m-2 mt-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white flex gap-x-2 items-center">
            <TiFlowSwitch size={22} />
            Context Switching
          </h2>

          <div className="flex items-center gap-x-3 text-slate-400">
            {/* Left arrow */}
            <button
              onClick={handlePrevDay}
              className="hover:text-white transition"
              title="Previous day"
            >
              <IoIosArrowBack size={18} className="cursor-pointer" />
            </button>

            {/* Date label */}
            <span className="text-sm">
              {isToday(selectedDate) ? "Today" : formatPrettyDate(selectedDate)}
            </span>

            {/* Right arrow (hidden on today) */}
            {!isToday(selectedDate) && (
              <button
                onClick={handleNextDay}
                className="hover:text-white transition"
                title="Next day"
              >
                <IoIosArrowForward size={18} className="cursor-pointer" />
              </button>
            )}
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <Metric label="Switches" value={total} />
          <Metric label="Per Hour" value={perHour} />
          <Metric
            label="Top Trigger"
            value={topTransition ? formatAppName(topTransition[0]) : "—"}
            truncate
          />
        </div>

        {/* Recent switches */}
        <div className="space-y-2">
          {visibleSwitches.map((s, i) => (
            <div
              key={i}
              className="flex items-center justify-between text-sm bg-[#212126] rounded-lg px-3 py-2"
            >
              <span className="text-slate-300 truncate">
                {formatAppName(s?.from_app)} → {formatAppName(s?.to_app)}
              </span>
              <span className="text-slate-400">
                {formatSeconds(s?.delta_seconds)}
              </span>
            </div>
          ))}

          {switches.length === 0 && (
            <div className="text-center text-slate-500 text-sm py-8">
              No rapid context switches today 🎯
            </div>
          )}
        </div>

        {/* Show more / less */}
        {switches.length > MAX_VISIBLE && (
          <button
            onClick={() => setShowAll((p) => !p)}
            className="w-full text-sm text-primary hover:underline mt-2 cursor-pointer"
          >
            {showAll ? "Show less" : `Show all (${switches.length})`}
          </button>
        )}
      </div>

      {/* Description */}
      <div className="text-xs text-slate-500 px-3 pb-3 text-center">
        <div className="leading-relaxed">
          <div>
            Context switching happens when you frequently jump between apps (for
            example: Editor → Browser → Chat → Editor).
          </div>
          <div>
            Frequent switching increases mental load and reduces deep focus.
            This metric helps you spot distraction patterns.
          </div>
        </div>
      </div>
    </>
  );
}
