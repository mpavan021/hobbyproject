import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { Marker } from "react-leaflet";

function makeBusIcon(selected) {
  return L.divIcon({
    className: "",
    html: `
      <div class="bus-marker ${selected ? "bus-marker-selected" : ""}">
        <div class="bus-marker-window"></div>
        <span>BUS</span>
      </div>
    `,
    iconSize: [52, 52],
    iconAnchor: [26, 26],
    popupAnchor: [0, -24]
  });
}

export default function SmoothBusMarker({ bus, selected, onSelectBus, children }) {
  const previousPosition = useRef([bus.lat, bus.lng]);
  const [position, setPosition] = useState([bus.lat, bus.lng]);

  useEffect(() => {
    const from = previousPosition.current;
    const to = [bus.lat, bus.lng];
    const start = performance.now();
    const duration = 1700;
    let frameId;

    function animate(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setPosition([
        from[0] + (to[0] - from[0]) * eased,
        from[1] + (to[1] - from[1]) * eased
      ]);

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      } else {
        previousPosition.current = to;
      }
    }

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [bus.lat, bus.lng]);

  return (
    <Marker
      position={position}
      icon={makeBusIcon(selected)}
      eventHandlers={{
        click: () => onSelectBus(bus.id)
      }}
    >
      {children}
    </Marker>
  );
}
