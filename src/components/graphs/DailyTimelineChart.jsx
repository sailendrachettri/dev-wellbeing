import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from "chart.js";
import { formatSeconds } from "../../utils/date-time/formatSeconds";
import { getWeekRange } from "../../utils/date-time/getWeekRange";
import { useRef } from "react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const DailyTimelineChart = ({ setSelectedDate, selectedDate }) => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0); // pagination (week index)
  const { startLabel, endLabel } = getWeekRange(page);
  const chartRef = useRef(null);

  const handleBarClick = (event) => {
    const chart = chartRef.current;
    if (!chart) return;

    const elements = chart.getElementsAtEventForMode(
      event.nativeEvent,
      "nearest",
      { intersect: true },
      true
    );

    if (!elements.length) return;

    const index = elements[0].index;
    const selectedDate = [...data].reverse()[index].date;

    setSelectedDate(selectedDate);
  };

  useEffect(() => {
    fetchWeek();
  }, [page]);

  const fetchWeek = async () => {
    const res = await invoke("get_daily_usage", {
      limit: 7,
      offset: page * 7,
    });

    setData(res);
  };

  // Ensure exactly 7 bars (fill missing days with 0)
  const labels = [...data]
    .reverse()
    .map((d) =>
      new Date(d.date).toLocaleDateString("en-US", { weekday: "short" })
    );

  const values = [...data].reverse().map((d) => d.total_seconds);

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: `#14d595`,
        borderRadius: 6,
        barThickness: 28,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,

    onHover: (_, activeElements, chart) => {
      if (!chart?.canvas) return;

      chart.canvas.style.cursor =
        activeElements.length > 0 ? "pointer" : "default";
    },

    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx) => formatSeconds(ctx.raw),
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#d1d5db" },
        grid: { display: false },
      },
      y: {
        ticks: {
          color: "#d1d5db",
          callback: (v) => formatSeconds(v),
        },
        grid: {
          color: "rgba(255,255,255,0.06)",
        },
      },
    },
  };

  return (
    <div className="bg-zinc-900 rounded-xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-emerald-400">
            Daily Usage Timeline
          </h2>
          <p className="text-sm text-gray-400">
            {startLabel} – {endLabel}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 bg-zinc-800 rounded hover:bg-zinc-700"
          >
            ← Prev
          </button>

          <button
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="px-3 py-1 bg-zinc-800 rounded hover:bg-zinc-700 disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-75">
        {data.length === 0 ? (
          <p className="text-gray-400">No usage data</p>
        ) : (
          <Bar
            ref={chartRef}
            data={chartData}
            options={options}
            onClick={handleBarClick}
          />
        )}
      </div>
    </div>
  );
};

export default DailyTimelineChart;
