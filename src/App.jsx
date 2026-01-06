import "./App.css";
import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { formatSeconds } from "./utils/date-time/formatSeconds";

export default function App() {
  const [currentApp, setCurrentApp] = useState("Detecting...");
  const [usage, setUsage] = useState([]);

  const lastApp = useRef(null);
  const lastTime = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(async () => {
      const app = await invoke("get_active_app");
      const now = Date.now();

      if (lastApp.current) {
        const diff = Math.floor((now - lastTime.current) / 1000);

        await invoke("save_app_usage", {
          appName: lastApp.current,
          seconds: diff,
        });
      }

      lastApp.current = app;
      lastTime.current = now;
      setCurrentApp(app);

      const data = await invoke("get_usage_today");
      setUsage(data);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-6">
      <h1 className="text-xl mb-4">
        Active App: <span className="text-emerald-400">{currentApp}</span>
      </h1>

      <h2 className="text-lg mb-2">Today's Usage</h2>

      <ul className="space-y-2">
        {usage.map((u) => (
          <li key={u.app} className="flex justify-between">
            <span>{u.app}</span>
            <span>{formatSeconds(u.seconds)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
