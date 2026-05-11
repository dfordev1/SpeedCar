import type { LatLng, Place, SpeedCarProfile, TripState } from "@speedcar/shared";

/**
 * Public content payloads (JSON-serialized into event.content). These live
 * in a dedicated file so clients can import types without pulling in the
 * Nostr runtime.
 */

export interface DriverPresenceContent extends LatLng {
  heading?: number;
  speedKph?: number;
  seats?: number;
}

export interface RideRequestContent {
  requestId: string;
  pickup: Place;
  dropoff: Place;
  paxCount: number;
  notes?: string;
}

export interface RideOfferContent {
  requestId: string;
  etaSeconds: number;
  fareHint?: {
    currency: string;
    amount: number;
    note?: string;
  };
  driver: Pick<SpeedCarProfile, "name" | "vehicle"> & {
    rating?: number;
  };
}

export interface RideAcceptContent {
  requestId: string;
  /** Optional: inline SDP offer. Usually sent via WEBRTC_SIGNAL instead. */
  webrtcOffer?: RTCSessionDescriptionInit;
}

export interface TripStateContent {
  requestId: string;
  state: TripState;
  reason?: string;
  at: number;
}

export type WebRTCSignalContent =
  | { type: "offer"; payload: RTCSessionDescriptionInit }
  | { type: "answer"; payload: RTCSessionDescriptionInit }
  | { type: "ice"; payload: RTCIceCandidateInit };

export interface ReviewContent {
  comment?: string;
  role: "rider" | "driver";
}
