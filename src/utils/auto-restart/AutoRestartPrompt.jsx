import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import toast from "react-hot-toast";

const AutoRestartPrompt = () => {
  const [autostartEnabled, setAutostartEnabled] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  const checkAutostartStatus = async () => {
    try {
      const isEnabled = await invoke("plugin:autostart|is_enabled");
      setAutostartEnabled(isEnabled);
      return isEnabled;
    } catch (err) {
      console.error("Autostart check failed:", err);
      return false;
    }
  };

  const enableAutostart = async () => {
    try {
      setLoading(true);
      await invoke("plugin:autostart|enable");

      const status = await checkAutostartStatus();
      if (status) {
        setShowPrompt(false);
        toast.success("Auto-start enabled 🚀");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to enable auto-start");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const isEnabled = await checkAutostartStatus();
      if (!isEnabled) setShowPrompt(true);
      setInitialCheckDone(true);
    };
    init();
  }, []);

  return (
    <>
      {initialCheckDone && showPrompt && !autostartEnabled && (
        <div className="fixed bottom-6 right-6 z-50 w-[320px] animate-slide-in">
          <div className="rounded-xl border border-gray-200 bg-white shadow-xl">
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl"></div>

                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Enable Auto-start
                  </h3>
                  <p className="mt-1 text-xs text-gray-600 leading-relaxed">
                    Start Dev Wellbeing automatically on system boot to ensure
                    uninterrupted tracking.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setShowPrompt(false)}
                  className="flex-1 rounded-lg cursor-pointer border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 transition"
                >
                  Later
                </button>

                <button
                  onClick={enableAutostart}
                  disabled={loading}
                  className="flex-1 cursor-pointer rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-secondary disabled:opacity-60 transition"
                >
                  {loading ? "Enabling..." : "Enable"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AutoRestartPrompt;
