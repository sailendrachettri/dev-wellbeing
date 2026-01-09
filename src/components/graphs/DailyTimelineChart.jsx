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
    const res = await invoke("get_week_timeline_usage", {
      limit: 7,
      offset: page,
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
  const reversedData = [...data].reverse();

  const backgroundColors = reversedData.map(
    (d) =>
      d.date === selectedDate
        ? "red" // highlighted bar
        : "rgba(20, 213, 149, 0.65)" // faded bars
  );

  const chartData = {
    labels,
    datasets: [
      {
        label: "Usage Time",
        data: values,
        backgroundColor: backgroundColors,
        borderColor: reversedData.map((d) =>
          d.date === selectedDate ? "#ffffff" : "transparent"
        ),
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
      legend: {
        display: false,
      },
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
    <div className="bg-zinc-900 rounded-xl px-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <div className="text-xl flex items-center justify-start flex-nowrap gap-x-2 font-bold text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-9 text-primary"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
              />
            </svg>
            <div>
              <p>Weekly Usage Timeline</p>
              <p className="text-sm font-normal text-gray-400">
                {startLabel} – {endLabel}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 bg-dark rounded hover:bg-zinc-700 cursor-pointer"
          >
            ← Prev
          </button>

          <button
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className={`${
              page === 0 ? "cursor-not-allowed" : "cursor-pointer"
            } px-3 py-1 bg-dark rounded hover:bg-zinc-700 disabled:opacity-40`}
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
