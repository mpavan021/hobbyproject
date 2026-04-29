# Live College Transport Dashboard

A complete full-stack bus tracking dashboard using only open-source technologies:

- Backend: Node.js, Express, Socket.IO
- Frontend: React, Vite, Tailwind CSS, Framer Motion
- Map: Leaflet with OpenStreetMap tiles

## Features

- Tracks at least 5 seeded college buses around Bangalore
- Simulates GPS movement every 2 seconds
- Pushes live updates with Socket.IO
- Displays animated bus markers on an OpenStreetMap map
- Shows bus number, route, lat/lng, ETA, speed, and delay status
- Admin panel can add, update, and delete buses in real time
- Works across multiple browser tabs because all clients receive the same WebSocket updates
- Includes optional dark mode

## Project Structure

```text
live-college-transport-dashboard/
  backend/
    src/server.js
    package.json
  frontend/
    src/
      components/
        AdminPanel.jsx
        BusDetails.jsx
        BusList.jsx
        BusMap.jsx
        SmoothBusMarker.jsx
      api.js
      App.jsx
      main.jsx
      styles.css
    index.html
    package.json
    postcss.config.js
    tailwind.config.js
  package.json
  README.md
```

## Setup

Install dependencies for both apps:

```bash
npm run install:all
```

Run the backend:

```bash
npm run dev:backend
```

Run the frontend in another terminal:

```bash
npm run dev:frontend
```

Open the frontend at:

```text
http://localhost:5173
```

The backend runs at:

```text
http://localhost:5001
```

## API Endpoints

```http
GET /buses
POST /add-bus
PUT /update-bus/:id
DELETE /delete-bus/:id
```

Example add bus body:

```json
{
  "id": "BUS-200",
  "lat": 12.9716,
  "lng": 77.5946,
  "route": "New Campus Route",
  "scheduledMinutes": 10
}
```

## Testing Checklist

- Open `http://localhost:5173`
- Confirm 5 buses are visible near Bangalore
- Wait 2 seconds and confirm buses move smoothly
- Click a bus marker and check popup details
- Add a bus from the admin panel and confirm it appears instantly
- Edit a bus location and confirm the marker moves
- Delete a bus and confirm it disappears from the map
- Open a second browser tab and confirm both tabs stay synced
