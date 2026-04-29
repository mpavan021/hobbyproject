import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { motion } from "framer-motion";
import { Activity, MapPin, Moon, RadioTower, Sun } from "lucide-react";
import AdminPanel from "./components/AdminPanel.jsx";
import BusMap from "./components/BusMap.jsx";
import BusDetails from "./components/BusDetails.jsx";
import BusList from "./components/BusList.jsx";
import { API_BASE_URL } from "./api.js";
import svitLogo from "./assets/svit-logo-final.png";

export default function App() {
  const [buses, setBuses] = useState([]);
  const [selectedBusId, setSelectedBusId] = useState(null);
  const [connected, setConnected] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const socket = io(API_BASE_URL);

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("bus:update", (nextBuses) => {
      setBuses(nextBuses);
      setSelectedBusId((currentId) => {
        if (!currentId) return currentId;
        return nextBuses.some((bus) => bus.id === currentId) ? currentId : null;
      });
    });

    return () => socket.disconnect();
  }, []);

  const selectedBus = useMemo(
    () => buses.find((bus) => bus.id === selectedBusId) || buses[0],
    [buses, selectedBusId]
  );

  const delayedCount = buses.filter((bus) => bus.delayStatus === "Delayed").length;

  return (
    <main className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-slate-100 text-slate-950 transition-colors dark:bg-slate-950 dark:text-white">
        <header className="border-b border-white/70 bg-white/85 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
            <div className="grid grid-cols-[82px_1fr_82px] items-center gap-3 sm:grid-cols-[118px_1fr_118px]">
              <CollegeLogo />

              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-300 sm:text-sm">
                  OpenStreetMap + Socket.IO
                </p>
                <h1 className="mt-1 text-2xl font-black uppercase text-slate-950 dark:text-white sm:text-4xl">
                  SVIT TRANSPORT HANDLE
                </h1>
              </div>

              <CollegeBusIcon />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <StatusPill icon={<RadioTower size={16} />} label={connected ? "Live connected" : "Reconnecting"} active={connected} />
              <StatusPill icon={<Activity size={16} />} label={`${buses.length} buses tracked`} active />
              <StatusPill icon={<MapPin size={16} />} label={`${delayedCount} delayed`} active={delayedCount === 0} />
              <button
                onClick={() => setDarkMode((value) => !value)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                title="Toggle dark mode"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>
        </header>

        <section className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:px-6 xl:grid-cols-[1fr_400px]">
          <div className="min-h-[640px] overflow-hidden rounded-2xl border border-white bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <BusMap buses={buses} selectedBusId={selectedBus?.id} onSelectBus={setSelectedBusId} />
          </div>

          <aside className="grid gap-5">
            <BusDetails bus={selectedBus} />
            <BusList buses={buses} selectedBusId={selectedBus?.id} onSelectBus={setSelectedBusId} />
            <AdminPanel buses={buses} selectedBus={selectedBus} />
          </aside>
        </section>
      </div>
    </main>
  );
}

function CollegeLogo() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -14, scale: 0.94 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      className="flex justify-start"
      aria-label="SVIT college logo"
    >
      <img
        src={svitLogo}
        alt="Sai Vidya Institute of Technology logo"
        className="svit-logo-img h-20 w-20 object-contain sm:h-28 sm:w-28"
      />
    </motion.div>
  );
}

function CollegeBusIcon() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 14, scale: 0.94 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      className="flex justify-end"
      aria-label="College bus icon"
    >
      <div className="college-bus-scene">
        <div className="college-bus-3d">
          <div className="bus-roof" />
          <div className="bus-windshield" />
          <div className="bus-window bus-window-one" />
          <div className="bus-window bus-window-two" />
          <div className="bus-window bus-window-three" />
          <div className="bus-door" />
          <div className="bus-headlight" />
          <div className="bus-label">SVIT</div>
          <div className="bus-wheel bus-wheel-left">
            <span />
          </div>
          <div className="bus-wheel bus-wheel-right">
            <span />
          </div>
        </div>
        <div className="bus-shadow" />
      </div>
    </motion.div>
  );
}

function StatusPill({ icon, label, active }) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-bold shadow-sm ${
        active
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200"
          : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-200"
      }`}
    >
      {icon}
      {label}
    </div>
  );
}
