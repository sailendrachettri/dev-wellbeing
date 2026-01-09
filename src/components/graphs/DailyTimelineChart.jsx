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
import { addDays } from "../../utils/date-time/addDays";
import { getTodayDate } from "../../utils/date-time/getTodayDate";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const DailyTimelineChart = ({ setSelectedDate, selectedDate }) => {
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const SELECTED_COLOR = "#42eca0";
  const FADED_COLOR = "rgba(66, 236, 160, 0.35)";

  const [earliestDate, setEarliestDate] = useState(null);

  const [page, setPage] = useState(0);
  const [data, setData] = useState([]);
  const { startDate, endDate, startLabel, endLabel, weekDates } =
    getWeekRange(page);
  const chartRef = useRef(null);
  const isPrevDisabled = earliestDate ? selectedDate <= earliestDate : true;

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
    setSelectedDate(weekDates[index]);
  };

  const clampToToday = (date) => {
    const today = getTodayDate();
    return date > today ? today : date;
  };

  const handlePrev = () => {
    if (!earliestDate) return;
    const prevDate = addDays(selectedDate, -1);
    if (prevDate < earliestDate) return;

    if (selectedDate === startDate) {
      setPage((p) => p + 1);
      setSelectedDate(prevDate);
    } else {
      setSelectedDate(prevDate);
    }
  };

  const handleNext = () => {
    const nextDate = addDays(selectedDate, 1);

    if (nextDate > getTodayDate()) return;

    if (selectedDate === endDate) {
      setPage((p) => Math.max(0, p - 1));
      setSelectedDate(clampToToday(nextDate));
    } else {
      setSelectedDate(nextDate);
    }
  };

  useEffect(() => {
    invoke("get_earliest_usage_date")
      .then((date) => setEarliestDate(date))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedDate < startDate) {
      setSelectedDate(startDate);
    } else if (selectedDate > endDate) {
      setSelectedDate(clampToToday(endDate));
    }
  }, [page]);

  useEffect(() => {
    if (!selectedDate) {
      setSelectedDate(getTodayDate());
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchWeek = async () => {
      try {
        const res = await invoke("get_week_timeline_usage", {
          startOfWeek: startDate,
          endOfWeek: endDate,
        });

        if (isMounted) {
          setData(res);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchWeek();

    const interval = setInterval(fetchWeek, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [page, startDate, endDate]);

  const usageMap = Object.fromEntries(
    data.map((d) => [d.date, d.total_seconds])
  );

  const values = weekDates.map((date) => usageMap[date] ?? 0);

  const backgroundColors = weekDates.map((date) =>
    date === selectedDate ? SELECTED_COLOR : FADED_COLOR
  );

  const chartData = {
    labels: DAYS,
    datasets: [
      {
        data: values,
        backgroundColor: backgroundColors,
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
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-9 text-primary"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
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
            disabled={isPrevDisabled}
            onClick={() => {
              handlePrev();
            }}
            className={`${
              isPrevDisabled ? "cursor-not-allowed" : "cursor-pointer"
            } px-3 py-1 bg-dark rounded hover:bg-zinc-700 disabled:opacity-40`}
          >
            ← Prev
          </button>

          <button
            disabled={selectedDate >= getTodayDate()}
            onClick={() => {
              handleNext();
            }}
            className={`${
              selectedDate >= getTodayDate()
                ? "cursor-not-allowed"
                : "cursor-pointer"
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
