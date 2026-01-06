import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { formatSeconds } from "../utils/date-time/formatSeconds";
import { formatAppName } from "../utils/string-formate/formatAppName";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const periodToInvokeMap = {
  daily: "get_usage_today",
  weekly: "get_usage_weekly",
  monthly: "get_usage_monthly",
  yearly: "get_usage_yearly",
};

const UsageChart = () => {
  const [usage, setUsage] = useState([]);
  const [period, setPeriod] = useState("daily"); // default tab

  // Fetch usage data for selected period
  useEffect(() => {
    const fetchData = async () => {
      const fnName = periodToInvokeMap[period];
      if (!fnName) return;
      const data = await invoke(fnName);
      setUsage(data);
    };

    fetchData();
  }, [period]);

  const labels = usage.map((u) => formatAppName(u.app));
  const dataValues = usage.map((u) => u.seconds);

  const data = {
    labels,
    datasets: [
      {
        label: "Usage",
        data: dataValues,
        backgroundColor: "rgba(16, 185, 129, 0.7)", // emerald-400
        borderColor: "rgba(16, 185, 129, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => formatSeconds(context.raw),
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#d1d5db",
          autoSkip: false,
          maxRotation: 45,
          minRotation: 0,
        },
        grid: {
          color: "rgba(255, 255, 255, 0.05)", // 👈 very light grid
          drawBorder: false,
        },
      },
      y: {
        ticks: {
          color: "#d1d5db",
          callback: (value) => formatSeconds(value),
        },
        grid: {
          color: "rgba(255, 255, 255, 0.06)", // 👈 subtle horizontal lines
          drawBorder: false,
        },
      },
    },
  };

  return (
    <div className="bg-zinc-900 text-white rounded-lg shadow-md min-h-[400px]">
      {/* Tabs */}
      <div className="flex gap-4 mb-8">
        {["daily", "weekly", "monthly", "yearly"].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-md font-semibold transition ${
              period === p
                ? "bg-emerald-400 text-zinc-900"
                : "bg-zinc-800 text-gray-300 hover:bg-zinc-700"
            }`}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Chart */}
      {usage.length === 0 ? (
        <p className="text-gray-400">No usage data for {period} yet...</p>
      ) : (
        <Bar data={data} options={options} />
      )}
    </div>
  );
};

export default UsageChart;
