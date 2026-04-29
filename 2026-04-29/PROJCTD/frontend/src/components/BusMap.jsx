import { MapContainer, Popup, TileLayer } from "react-leaflet";
import { motion } from "framer-motion";
import SmoothBusMarker from "./SmoothBusMarker.jsx";

const BANGALORE_CENTER = [12.9716, 77.5946];

export default function BusMap({ buses, selectedBusId, onSelectBus }) {
  return (
    <div className="relative h-full min-h-[640px]">
      <MapContainer center={BANGALORE_CENTER} zoom={12} scrollWheelZoom className="h-full min-h-[640px] w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {buses.map((bus) => (
          <SmoothBusMarker key={bus.id} bus={bus} selected={bus.id === selectedBusId} onSelectBus={onSelectBus}>
            <Popup>
              <div className="min-w-52 space-y-2 text-sm">
                <strong className="block text-base text-slate-950">{bus.id}</strong>
                <p className="text-slate-600">{bus.route}</p>
                <p>Lat: {bus.lat.toFixed(5)}</p>
                <p>Lng: {bus.lng.toFixed(5)}</p>
                <p>ETA: {bus.etaMinutes} min</p>
                <span className={bus.delayStatus === "On Time" ? "font-bold text-emerald-600" : "font-bold text-red-600"}>
                  {bus.delayStatus}
                </span>
              </div>
            </Popup>
          </SmoothBusMarker>
        ))}
      </MapContainer>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="pointer-events-none absolute left-4 top-4 z-[500] rounded-xl bg-white/95 px-4 py-3 shadow-lg backdrop-blur dark:bg-slate-950/90"
      >
        <p className="text-xs font-bold uppercase tracking-wide text-blue-600 dark:text-blue-300">Bangalore live map</p>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">GPS updates every 2 seconds</p>
      </motion.div>
    </div>
  );
}
