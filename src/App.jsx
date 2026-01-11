import "./App.css";
import Footer from "./components/common/Footer";
import Home from "./components/Home";
import AutoRestartPrompt from "./utils/auto-restart/AutoRestartPrompt";

export default function App() {
  return (
    <>
      <AutoRestartPrompt />

      <Home />
      <Footer />
    </>
  );
}
