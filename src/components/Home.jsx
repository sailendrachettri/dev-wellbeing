import { useEffect } from "react";
import UsageChart from "../reusable/UsageChart";
import { invoke } from "@tauri-apps/api/core";

const Home = () => {
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const app = await invoke("get_active_app");
        console.log("checking..")

        if (app) {
          await invoke("save_app_usage", {
            appName: app,
            seconds: 5,
          });
        }
      } catch (err) {
        console.error("Usage tracking failed:", err);
      }
    }, 5000); // 👈 every 5 seconds

    // cleanup when component unmounts
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 min-h-screen bg-zinc-900 text-white">
      <h1 className="text-2xl font-bold text-emerald-400">📊 App Usage</h1>

      <div className="pt-4">
        <UsageChart />
      </div>
    </div>
  );
};

export default Home;
