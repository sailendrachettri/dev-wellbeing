const METRIC_INFO = {
  Switches: "Total number of times you switched between apps today.",
  "Per Hour": "Average number of app switches per hour since today started.",
  "Top Trigger":
    "The most frequent app-to-app transition causing context switches.",
};

const Metric = ({ label, value }) => {
  const description = METRIC_INFO[label];

  return (
    <div className="relative group bg-[#212126] rounded-lg p-3 cursor-default">
      {/* Label */}
      <div className="text-xs text-slate-400">{label}</div>

      {/* Value */}
      <div
        className={`font-semibold text-white truncate ${
          typeof value === "string" && value.length > 8 ? "text-[14px]" : "text-lg"
        }`}
      >
        {value}
      </div>

      {/* Tooltip */}
      {description && (
        <div
          className="pointer-events-none absolute z-20 bottom-full left-1/2 mb-2 w-52 -translate-x-1/2
                        rounded-md bg-zinc-800 px-3 py-2 text-xs text-slate-300
                        opacity-0 scale-95 transition-all duration-150
                        group-hover:opacity-100 group-hover:scale-100"
        >
          {description}

          {/* Tooltip arrow */}
          <div
            className="absolute left-1/2 top-full -translate-x-1/2 
                          border-4 border-transparent border-t-zinc-800"
          />
        </div>
      )}
    </div>
  );
};

export default Metric;
