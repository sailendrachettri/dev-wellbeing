import { useState } from "react";

const TabDropdown = ({ selectedTab, setSelectedTab }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative pt-3 pl-5 text-xs">
      <button
        onClick={() => setOpen(!open)}
        className="
          px-3 py-1 rounded-full
          border border-zinc-800
          bg-dark text-white
          flex items-center gap-2 cursor-pointer
        "
      >
        {selectedTab === "wellbeing" && "Wellbeing"}
        {selectedTab === "pomodoro" && "Pomodoro"}
        {selectedTab === "context-switches" && "Context Switching"}
        <span className="text-gray-400">▾</span>
      </button>

      {open && (
        <div className="absolute mt-2 w-32 rounded-md z-40 border border-zinc-800 bg-dark shadow-lg">
          {["wellbeing", "pomodoro", "context-switches"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setSelectedTab(tab);
                setOpen(false);
              }}
              className={`
                w-full text-left px-3 py-2 cursor-pointer
                hover:bg-primary/70
                ${
                  selectedTab === tab
                    ? "text-white"
                    : "text-gray-400 hover:text-gray-100"
                }
              `}
            >
              {tab === "wellbeing" && "Wellbeing"}
              {tab === "pomodoro" && "Pomodoro"}
              {tab === "context-switches" && "Context Switching"}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TabDropdown;
