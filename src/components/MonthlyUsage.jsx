import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { formatSeconds } from "../utils/date-time/formatSeconds";

const MonthlyUsage = () => {
  const [usage, setUsage] = useState([]);

  useEffect(() => {
    const fetchUsage = async () => {
      const data = await invoke("get_usage_monthly");
      setUsage(data);
    };
    fetchUsage();
  }, []);

  return (
    <div className="bg-zinc-900 text-white p-6 rounded-lg shadow-md">
      <ul className="space-y-3">
        {usage.map((u) => (
          <li key={u.app} className="flex justify-between bg-zinc-800 p-3 rounded-md hover:bg-zinc-700 transition">
            <span className="capitalize">
              {u.app.replace(/\.exe$/i, "")}
            </span>
            <span>{formatSeconds(u.seconds)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MonthlyUsage;
