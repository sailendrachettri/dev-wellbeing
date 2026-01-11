import { useEffect, useRef, useState } from "react";
import { FaPlay, FaPause, FaRedo, FaCog, FaTimes } from "react-icons/fa";
import beepSound from "../../assets/sounds/beep.mp3";

const DEFAULT_TIME = 25 * 60; // 25 minutes in seconds

const Pomodoro = () => {
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(25);
  const [totalSeconds, setTotalSeconds] = useState(DEFAULT_TIME);
  const [activePreset, setActivePreset] = useState(25);

  const intervalRef = useRef(null);
  const beepRef = useRef(null);

  // Calculate progress percentage
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;
  const circumference = 2 * Math.PI * 140; // radius = 140
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Format time mm:ss
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Timer logic
  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setIsRunning(false);
          playBeep();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const playBeep = () => {
    if (!beepRef.current) return;

    // Play 3 beeps
    let count = 0;

    const play = () => {
      if (count >= 3) return;

      beepRef.current.currentTime = 0;
      beepRef.current.play();
      count++;

      setTimeout(play, 400);
    };

    play();
  };

  useEffect(() => {
    beepRef.current = new Audio(beepSound);
    beepRef.current.volume = 0.8; // adjust if needed
  }, []);

  const start = () => setIsRunning(true);
  const pause = () => setIsRunning(false);

  const reset = () => {
    setIsRunning(false);
    setSecondsLeft(totalSeconds);
  };

  const applyCustomTime = () => {
    const newTime = customMinutes * 60;
    setActivePreset(null); // custom time selected
    setIsRunning(false);
    setSecondsLeft(newTime);
    setTotalSeconds(newTime);
  };

  const setPreset = (minutes) => {
    setActivePreset(minutes);
    setCustomMinutes(minutes);

    const newTime = minutes * 60;
    setIsRunning(false);
    setSecondsLeft(newTime);
    setTotalSeconds(newTime);
  };

  return (
    <div className="flex items-center justify-center flex-col shadow-md mb-4  mx-5 min-h-[85vh] rounded-lg overflow-hidden">
      <div className="w-full max-w-md px-6 text-slate-200 ">
        <div className="flex items-center justify-center flex-col">
          {/* Time Selection */}
          <div className="flex items-center gap-x-4 mb-2">
            <button
              onClick={() => setPreset(25)}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition
    ${
      activePreset === 25
        ? "bg-primary text-white"
        : "bg-gray-100 text-gray-700 hover:bg-slate-100  cursor-pointer"
    }`}
            >
              25 min
            </button>

            <button
              onClick={() => setPreset(45)}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition
    ${
      activePreset === 45
        ? "bg-primary text-white"
        : "bg-gray-100 text-gray-700 hover:bg-slate-100  cursor-pointer"
    }`}
            >
              45 min
            </button>

            <div className="flex items-center gap-1 rounded-full border border-gray-200 px-2 py-1">
              <input
                type="number"
                min="1"
                max="120"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(Number(e.target.value))}
                className="w-10 text-center text-xs font-semibold bg-transparent outline-none
                 [appearance:textfield]
                 [&::-webkit-outer-spin-button]:appearance-none
                 [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-xs text-gray-400">m</span>

              <button
                onClick={applyCustomTime}
                className="ml-1 px-2 py-0.5 text-xs rounded-full bg-orange-500 text-white hover:bg-orange-600 transition"
              >
                Go
              </button>
            </div>
          </div>

          {/* Circular Timer */}
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              {/* SVG Circle */}
              <svg className="transform -rotate-90" width="320" height="320">
                {/* Background Circle */}
                <circle
                  cx="160"
                  cy="160"
                  r="140"
                  stroke="#e6e2e2"
                  strokeWidth="12"
                  fill="none"
                />
                {/* Progress Circle */}
                <circle
                  cx="160"
                  cy="160"
                  r="140"
                  stroke="#42eca0"
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-linear"
                />
                <defs>
                  <linearGradient
                    id="gradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#dc2626" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Time Display */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl font-bold  tracking-tight">
                    {formatTime(secondsLeft)}
                  </div>
                  <div className="text-sm text-gray-500 mt-2 font-medium">
                    {isRunning ? "Focus Time" : "Ready to focus?"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center w-full ps-12 gap-4">
            <button
              onClick={reset}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all hover:scale-105 active:scale-95"
              title="Reset"
            >
              <FaRedo className="w-4 h-4 text-primary/70" />
            </button>

            <button
              onClick={isRunning ? pause : start}
              className="p-4 rounded-full  bg-primary cursor-pointer hover:bg-primary/90"
              title={isRunning ? "Pause" : "Start"}
            >
              {isRunning ? (
                <FaPause className="w-6 h-6 text-white" />
              ) : (
                <FaPlay className="w-6 h-6 text-white" />
              )}
            </button>

            <div className="w-14 h-14"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pomodoro;
