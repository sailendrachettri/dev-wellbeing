import { useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { formatSeconds } from "../../utils/date-time/formatSeconds";
import { formatAppName } from "../../utils/string-formate/formatAppName";
import { TiFlowSwitch } from "react-icons/ti";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

const MAX_VISIBLE = 10;

const getTopTransition = (switches) => {
  const map = {};

  switches?.forEach((s) => {
    const key = `${s?.from_app} → ${s?.to_app}`;
    map[key] = (map[key] || 0) + 1;
  });

  return Object.entries(map).sort((a, b) => b[1] - a[1])[0];
};

function Metric({ label, value, truncate }) {
  return (
    <div className="bg-[#212126] rounded-lg p-3">
      <div className="text-xs text-slate-400">{label}</div>
      <div
        className={`text-lg font-semibold text-white ${
          truncate ? "truncate" : ""
        }`}
        title={value}
      >
        {value}
      </div>
    </div>
  );
}

export default function ContextSwitchPanel() {
  const [switches, setSwitches] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    invoke("get_today_context_switches")
      .then(setSwitches)
      .catch(console.error);
  }, []);

  const total = switches.length;
  const hoursPassed = Math.max(1, new Date().getHours());
  const perHour = (total / hoursPassed).toFixed(1);

  const topTransition = useMemo(
    () => getTopTransition(switches),
    [switches]
  );

  const visibleSwitches = showAll
    ? switches
    : switches.slice(0, MAX_VISIBLE);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4 m-2 mt-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white flex gap-x-2 items-center">
          <TiFlowSwitch size={22} />
          Context Switching
        </h2>
        <span className="text-sm text-slate-400">Today</span>
      </div>

      {/* Help Accordion */}
      <div className="bg-zinc-800/50 rounded-lg">
        <button
          onClick={() => setShowHelp((p) => !p)}
          className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-300"
        >
          <span>What is context switching?</span>
          {showHelp ? <FiChevronUp /> : <FiChevronDown />}
        </button>

        {showHelp && (
          <div className="px-3 pb-3 text-xs text-slate-400 leading-relaxed">
            Context switching happens when you frequently jump between apps
            (for example: Editor → Browser → Chat → Editor).
            <br />
            <br />
            Frequent switching increases mental load and reduces deep focus.
            This metric helps you spot distraction patterns.
          </div>
        )}
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
            className="flex items-center justify-between text-sm bg-dark rounded-lg px-3 py-2"
          >
            <span className="text-slate-200 truncate">
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
          className="w-full text-sm text-primary hover:underline mt-2"
        >
          {showAll ? "Show less" : `Show all (${switches.length})`}
        </button>
      )}
    </div>
  );
}
