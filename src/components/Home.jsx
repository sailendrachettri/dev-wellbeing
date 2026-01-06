import React, { useState } from "react";
import DailyUsesView from "./DailyUsesView";
import WeeklyUsage from "./WeeklyUsage";
import MonthlyUsage from "./MonthlyUsage";
import YearlyUsage from "./YearlyUsage";

const Home = () => {
  const [activeTab, setActiveTab] = useState("daily"); // default is daily

  const renderTab = () => {
    switch (activeTab) {
      case "daily":
        return <DailyUsesView />;
      case "weekly":
        return <WeeklyUsage />;
      case "monthly":
        return <MonthlyUsage />;
      case "yearly":
        return <YearlyUsage />;
      default:
        return <DailyUsesView />;
    }
  };

  const tabs = [
    { id: "daily", label: "Daily" },
    { id: "weekly", label: "Weekly" },
    { id: "monthly", label: "Monthly" },
    { id: "yearly", label: "Yearly" },
  ];

  return (
    <div className="p-6 min-h-screen bg-zinc-900 text-white">
      <h1 className="text-2xl font-bold mb-6 text-emerald-400">
        📊 App Usage
      </h1>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-4 py-2 rounded-md font-semibold transition ${
              activeTab === tab.id
                ? "bg-emerald-500 text-white"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>{renderTab()}</div>
    </div>
  );
};

export default Home;
