/**
 * Minimal geohash encoder/decoder (base-32, Gustavo Niemeyer).
 * No dependencies. Used for bucketing Nostr events by coarse location
 * so riders and drivers find each other without scanning the whole network.
 */

const BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";

export function encodeGeohash(lat: number, lng: number, precision = 6): string {
  if (precision < 1 || precision > 12) {
    throw new Error("precision must be 1..12");
  }

  let latLo = -90;
  let latHi = 90;
  let lngLo = -180;
  let lngHi = 180;

  let hash = "";
  let bits = 0;
  let bit = 0;
  let even = true;

  while (hash.length < precision) {
    if (even) {
      const mid = (lngLo + lngHi) / 2;
      if (lng >= mid) {
        bits = (bits << 1) | 1;
        lngLo = mid;
      } else {
        bits = bits << 1;
        lngHi = mid;
      }
    } else {
      const mid = (latLo + latHi) / 2;
      if (lat >= mid) {
        bits = (bits << 1) | 1;
        latLo = mid;
      } else {
        bits = bits << 1;
        latHi = mid;
      }
    }
    even = !even;
    bit++;
    if (bit === 5) {
      hash += BASE32[bits];
      bits = 0;
      bit = 0;
    }
  }

  return hash;
}

export function decodeGeohash(hash: string): { lat: number; lng: number; latErr: number; lngErr: number } {
  let latLo = -90;
  let latHi = 90;
  let lngLo = -180;
  let lngHi = 180;
  let even = true;

  for (const ch of hash) {
    const idx = BASE32.indexOf(ch);
    if (idx < 0) throw new Error(`invalid geohash char: ${ch}`);
    for (let mask = 16; mask > 0; mask >>= 1) {
      const bit = (idx & mask) !== 0;
      if (even) {
        const mid = (lngLo + lngHi) / 2;
        if (bit) lngLo = mid;
        else lngHi = mid;
      } else {
        const mid = (latLo + latHi) / 2;
        if (bit) latLo = mid;
        else latHi = mid;
      }
      even = !even;
    }
  }

  return {
    lat: (latLo + latHi) / 2,
    lng: (lngLo + lngHi) / 2,
    latErr: (latHi - latLo) / 2,
    lngErr: (lngHi - lngLo) / 2,
  };
}

/**
 * Return the 8 geohash neighbors of a cell at the same precision.
 * Useful for querying "my cell + all adjacent cells" on a relay.
 */
export function neighborsOfGeohash(hash: string): string[] {
  const { lat, lng, latErr, lngErr } = decodeGeohash(hash);
  const precision = hash.length;
  const deltas: Array<[number, number]> = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1],
  ];
  const out: string[] = [];
  for (const [dLat, dLng] of deltas) {
    const nLat = lat + dLat * 2 * latErr;
    const nLng = lng + dLng * 2 * lngErr;
    if (nLat > 90 || nLat < -90) continue;
    // wrap longitude
    let wLng = nLng;
    if (wLng > 180) wLng -= 360;
    if (wLng < -180) wLng += 360;
    out.push(encodeGeohash(nLat, wLng, precision));
  }
  return Array.from(new Set(out));
}

/** Haversine distance in meters. */
export function haversineMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLng / 2);
  const c =
    s1 * s1 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * s2 * s2;
  return 2 * R * Math.asin(Math.sqrt(c));
}
