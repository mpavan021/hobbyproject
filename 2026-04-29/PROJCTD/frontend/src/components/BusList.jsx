import { motion } from "framer-motion";
import { BusFront } from "lucide-react";

export default function BusList({ buses, selectedBusId, onSelectBus }) {
  return (
    <section className="rounded-2xl border border-white bg-white p-5 shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-black">Fleet</h2>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-200">
          {buses.length} active
        </span>
      </div>

      <div className="grid max-h-60 gap-2 overflow-auto pr-1">
        {buses.map((bus) => (
          <motion.button
            key={bus.id}
            whileHover={{ x: 4 }}
            onClick={() => onSelectBus(bus.id)}
            className={`flex items-center justify-between rounded-xl border p-3 text-left transition ${
              selectedBusId === bus.id
                ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950"
                : "border-slate-200 bg-white hover:border-blue-300 dark:border-slate-700 dark:bg-slate-900"
            }`}
          >
            <span className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-yellow-300 text-slate-950">
                <BusFront size={20} />
              </span>
              <span>
                <span className="block font-black">{bus.id}</span>
                <span className="block text-xs text-slate-500 dark:text-slate-400">{bus.route}</span>
              </span>
            </span>
            <span className={bus.delayStatus === "On Time" ? "text-sm font-black text-emerald-600" : "text-sm font-black text-red-600"}>
              {bus.etaMinutes}m
            </span>
          </motion.button>
        ))}
      </div>
    </section>
  );
}
