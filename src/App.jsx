import "./App.css";
import Home from "./components/Home";
import AutoRestartPrompt from "./utils/auto-restart/AutoRestartPrompt";

export default function App() {
  return (
    <>
      <AutoRestartPrompt />

      <Home />
    </>
  );
}
