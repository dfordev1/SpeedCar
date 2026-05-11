import { Map } from "../components/Map";
import { useGeolocation } from "../hooks/useGeolocation";

export function Rider() {
  const geo = useGeolocation();
  const center: [number, number] = geo.position
    ? [geo.position.coords.longitude, geo.position.coords.latitude]
    : [77.5946, 12.9716]; // Bengaluru default

  return (
    <div className="screen">
      <div className="stack">
        <h2 className="title">Rider</h2>
        <p className="subtitle">
          Phase 1: map + location only. Next phase wires up ride requests over
          Nostr and driver discovery by geohash.
        </p>
      </div>

      <Map center={center} zoom={14} />

      <div className="card stack">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <span className="subtitle">Your location</span>
          <span className={geo.position ? "pill live" : "pill"}>
            {geo.loading ? "locating…" : geo.position ? "live" : "unavailable"}
          </span>
        </div>
        {geo.error && (
          <p style={{ color: "var(--danger)", margin: 0 }}>{geo.error}</p>
        )}
        {geo.position && (
          <p className="mono">
            {geo.position.coords.latitude.toFixed(5)},{" "}
            {geo.position.coords.longitude.toFixed(5)}
          </p>
        )}
      </div>
    </div>
  );
}
