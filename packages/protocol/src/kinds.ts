/**
 * SpeedCar Nostr event kinds. See .kiro/steering/protocol.md for the full spec.
 *
 * Kinds chosen from parameterized-replaceable (30000-39999) and ephemeral
 * (20000-29999) ranges so they don't clash with mainstream Nostr events.
 */
export const KINDS = {
  /** Replaceable: user profile (role, name, vehicle). */
  PROFILE: 30078,

  /** Ephemeral: driver "I'm online near here" heartbeat. */
  DRIVER_PRESENCE: 27000,

  /** Ephemeral: rider "I need a ride" open broadcast. */
  RIDE_REQUEST: 27001,

  /** Ephemeral: driver's offer to a specific rider request. */
  RIDE_OFFER: 27002,

  /** Ephemeral: rider accepts a specific offer. */
  RIDE_ACCEPT: 27003,

  /** Ephemeral: trip state update (either party). */
  TRIP_STATE: 27004,

  /** Ephemeral: WebRTC signalling payload (SDP / ICE). */
  WEBRTC_SIGNAL: 27005,

  /** Regular, persistent: signed post-trip review. */
  REVIEW: 1986,
} as const;

export type SpeedCarKind = (typeof KINDS)[keyof typeof KINDS];

/** Version tag that goes on every SpeedCar event. */
export const PROTOCOL_VERSION_TAG: [string, string] = ["speedcar", "v0"];
