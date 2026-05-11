import { useEffect, useState } from "react";

export interface GeoState {
  position: GeolocationPosition | null;
  error: string | null;
  loading: boolean;
}

/**
 * One-shot geolocation request. For continuous tracking we'll add a
 * separate watcher hook when we wire up the driver presence heartbeat.
 */
export function useGeolocation(): GeoState {
  const [state, setState] = useState<GeoState>({
    position: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setState({ position: null, error: "Geolocation not supported", loading: false });
      return;
    }
    let cancelled = false;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!cancelled) setState({ position: pos, error: null, loading: false });
      },
      (err) => {
        if (!cancelled)
          setState({ position: null, error: err.message, loading: false });
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 30_000 },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
