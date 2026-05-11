import { useState } from "react";
import { Map } from "../components/Map";
import { useGeolocation } from "../hooks/useGeolocation";
import { encodeGeohash } from "@speedcar/shared";

export function Driver() {
  const geo = useGeolocation();
  const [online, setOnline] = useState(false);

  const center: [number, number] = geo.position
    ? [geo.position.coords.longitude, geo.position.coords.latitude]
    : [77.5946, 12.9716];

  const geohash = geo.position
    ? encodeGeohash(geo.position.coords.latitude, geo.position.coords.longitude, 6)
    : null;

  return (
    <div className="screen">
      <div className="stack">
        <h2 className="title">Driver</h2>
        <p className="subtitle">
          Phase 1: location + the online toggle. Next phase publishes presence
          events to relays every ~25s and subscribes for incoming ride requests.
        </p>
      </div>

      <Map center={center} zoom={14} />

      <div className="card stack">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <span className="subtitle">Status</span>
          <span className={online ? "pill live" : "pill"}>
            {online ? "online" : "offline"}
          </span>
        </div>
        <button
          className={online ? "" : "primary"}
          onClick={() => setOnline((v) => !v)}
        >
          {online ? "Go offline" : "Go online"}
        </button>
        {geohash && (
          <p className="mono">
            cell: {geohash} · {geo.position?.coords.latitude.toFixed(5)},{" "}
            {geo.position?.coords.longitude.toFixed(5)}
          </p>
        )}
        {geo.error && (
          <p style={{ color: "var(--danger)", margin: 0 }}>{geo.error}</p>
        )}
      </div>
    </div>
  );
}
