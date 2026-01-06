import UsageChart from "../reusable/UsageChart";

const Home = () => {
  return (
    <div className="p-6 min-h-screen bg-zinc-900 text-white">
      <h1 className="text-2xl font-bold text-emerald-400">
        📊 App Usage
      </h1>

      <div className="pt-4">
        <UsageChart />
      </div>
    </div>
  );
};

export default Home;
