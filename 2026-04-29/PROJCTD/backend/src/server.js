import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

const PORT = process.env.PORT || 5001;
const CLIENT_URLS = (process.env.CLIENT_URLS || "http://localhost:5173,http://127.0.0.1:5173")
  .split(",")
  .map((url) => url.trim());

const app = express();
app.use(cors({ origin: CLIENT_URLS }));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: CLIENT_URLS,
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

const COLLEGE_STOP = { lat: 12.9716, lng: 77.5946 };
const BANGALORE_BOUNDS = {
  minLat: 12.905,
  maxLat: 13.04,
  minLng: 77.515,
  maxLng: 77.705
};

let buses = [
  createBus("BUS-101", 12.9852, 77.6057, "North Campus Loop", 8),
  createBus("BUS-102", 12.9538, 77.5789, "City Market Route", 11),
  createBus("BUS-103", 13.0103, 77.6468, "Indiranagar Express", 14),
  createBus("BUS-104", 12.9279, 77.6271, "Koramangala Shuttle", 9),
  createBus("BUS-105", 12.9971, 77.5522, "Malleshwaram Route", 12)
];

function createBus(id, lat, lng, route = "Campus Route", scheduledMinutes = 10) {
  return {
    id,
    lat: Number(lat),
    lng: Number(lng),
    route,
    speedKmph: 24 + Math.floor(Math.random() * 16),
    bearing: Math.random() * Math.PI * 2,
    scheduledMinutes,
    updatedAt: new Date().toISOString()
  };
}

function toClientBus(bus) {
  const etaMinutes = calculateEtaMinutes(bus);
  return {
    ...bus,
    etaMinutes,
    delayStatus: etaMinutes <= bus.scheduledMinutes ? "On Time" : "Delayed"
  };
}

function calculateEtaMinutes(bus) {
  const distanceKm = haversineDistanceKm(bus.lat, bus.lng, COLLEGE_STOP.lat, COLLEGE_STOP.lng);
  return Math.max(1, Math.round((distanceKm / bus.speedKmph) * 60));
}

function haversineDistanceKm(lat1, lng1, lat2, lng2) {
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function simulateMovement() {
  buses = buses.map((bus) => {
    const turn = (Math.random() - 0.5) * 0.65;
    const bearing = bus.bearing + turn;
    const step = 0.0022 + Math.random() * 0.0018;
    let lat = bus.lat + Math.cos(bearing) * step;
    let lng = bus.lng + Math.sin(bearing) * step;

    if (lat <= BANGALORE_BOUNDS.minLat || lat >= BANGALORE_BOUNDS.maxLat) {
      lat = clamp(lat, BANGALORE_BOUNDS.minLat, BANGALORE_BOUNDS.maxLat);
    }

    if (lng <= BANGALORE_BOUNDS.minLng || lng >= BANGALORE_BOUNDS.maxLng) {
      lng = clamp(lng, BANGALORE_BOUNDS.minLng, BANGALORE_BOUNDS.maxLng);
    }

    return {
      ...bus,
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
      bearing,
      updatedAt: new Date().toISOString()
    };
  });

  broadcastBuses();
}

function broadcastBuses() {
  io.emit("bus:update", buses.map(toClientBus));
}

app.get("/health", (req, res) => {
  res.json({ status: "ok", buses: buses.length });
});

app.get("/buses", (req, res) => {
  res.json(buses.map(toClientBus));
});

app.post("/add-bus", (req, res) => {
  const { id, lat, lng, route, scheduledMinutes } = req.body;

  if (!id || lat === undefined || lng === undefined) {
    return res.status(400).json({ message: "Bus ID, latitude, and longitude are required." });
  }

  if (buses.some((bus) => bus.id === id)) {
    return res.status(409).json({ message: "A bus with this ID already exists." });
  }

  const bus = createBus(
    id,
    Number(lat),
    Number(lng),
    route || "Campus Route",
    Number(scheduledMinutes) || 10
  );
  buses.push(bus);
  broadcastBuses();
  res.status(201).json(toClientBus(bus));
});

app.put("/update-bus/:id", (req, res) => {
  const { id } = req.params;
  const existing = buses.find((bus) => bus.id === id);

  if (!existing) {
    return res.status(404).json({ message: "Bus not found." });
  }

  buses = buses.map((bus) => {
    if (bus.id !== id) return bus;

    return {
      ...bus,
      lat: req.body.lat !== undefined ? Number(req.body.lat) : bus.lat,
      lng: req.body.lng !== undefined ? Number(req.body.lng) : bus.lng,
      route: req.body.route || bus.route,
      scheduledMinutes:
        req.body.scheduledMinutes !== undefined ? Number(req.body.scheduledMinutes) : bus.scheduledMinutes,
      updatedAt: new Date().toISOString()
    };
  });

  const updated = buses.find((bus) => bus.id === id);
  broadcastBuses();
  res.json(toClientBus(updated));
});

app.delete("/delete-bus/:id", (req, res) => {
  const { id } = req.params;
  const initialCount = buses.length;
  buses = buses.filter((bus) => bus.id !== id);

  if (buses.length === initialCount) {
    return res.status(404).json({ message: "Bus not found." });
  }

  broadcastBuses();
  res.json({ message: "Bus deleted successfully.", id });
});

io.on("connection", (socket) => {
  socket.emit("bus:update", buses.map(toClientBus));
});

setInterval(simulateMovement, 2000);

server.listen(PORT, () => {
  console.log(`Live College Transport backend running on http://localhost:${PORT}`);
});
