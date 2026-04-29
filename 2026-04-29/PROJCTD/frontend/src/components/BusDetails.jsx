import { motion } from "framer-motion";
import { Clock3, MapPin, Navigation, Route } from "lucide-react";

export default function BusDetails({ bus }) {
  if (!bus) {
    return (
      <section className="rounded-2xl border border-white bg-white p-5 shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <p className="font-semibold text-slate-500">Waiting for buses...</p>
      </section>
    );
  }

  const onTime = bus.delayStatus === "On Time";

  return (
    <motion.section
      key={bus.id}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white bg-white p-5 shadow-lg dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-blue-600 dark:text-blue-300">Selected bus</p>
          <h2 className="mt-1 text-2xl font-black">{bus.id}</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{bus.route}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-black ${
            onTime ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
          }`}
        >
          {bus.delayStatus}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Metric icon={<Clock3 />} label="ETA" value={`${bus.etaMinutes} min`} />
        <Metric icon={<Navigation />} label="Speed" value={`${bus.speedKmph} km/h`} />
        <Metric icon={<MapPin />} label="Latitude" value={bus.lat.toFixed(5)} />
        <Metric icon={<Route />} label="Longitude" value={bus.lng.toFixed(5)} />
      </div>
    </motion.section>
  );
}

function Metric({ icon, label, value }) {
  return (
    <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
      <div className="mb-2 text-blue-600 dark:text-blue-300">{icon}</div>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-black sm:text-base">{value}</p>
    </div>
  );
}
