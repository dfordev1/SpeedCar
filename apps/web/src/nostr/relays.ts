import { SimplePool } from "nostr-tools/pool";
import { finalizeEvent, type Event, type EventTemplate } from "nostr-tools/pure";
import type { Filter } from "nostr-tools/filter";
import { PROTOCOL_VERSION_TAG } from "@speedcar/protocol";

/**
 * Relay pool. We publish to all relays and subscribe to all relays. If a
 * relay fails we don't block; the pool handles that per-connection.
 *
 * Defaults line up with .kiro/steering/relays.md. Users can customize in
 * settings later; stored at "speedcar:relays".
 */

export const DEFAULT_RELAYS: string[] = [
  "wss://relay.damus.io",
  "wss://relay.primal.net",
  "wss://nos.lol",
  "wss://relay.nostr.band",
  "wss://nostr.wine",
  "wss://relay.snort.social",
];

const RELAYS_KEY = "speedcar:relays";

export function loadRelays(): string[] {
  try {
    const raw = localStorage.getItem(RELAYS_KEY);
    if (!raw) return DEFAULT_RELAYS;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_RELAYS;
    return parsed.filter((r): r is string => typeof r === "string");
  } catch {
    return DEFAULT_RELAYS;
  }
}

export function saveRelays(relays: string[]): void {
  localStorage.setItem(RELAYS_KEY, JSON.stringify(relays));
}

/**
 * Singleton pool. SimplePool keeps one WebSocket per unique relay URL and
 * multiplexes subscriptions over it — exactly what we want.
 */
let pool: SimplePool | null = null;
export function getPool(): SimplePool {
  if (!pool) pool = new SimplePool();
  return pool;
}

/** Build, sign, and publish a SpeedCar event. Returns the signed event. */
export async function publishSpeedCarEvent(
  sk: Uint8Array,
  template: Omit<EventTemplate, "tags" | "created_at"> & {
    tags?: string[][];
    created_at?: number;
  },
): Promise<Event> {
  const tags = [...(template.tags ?? []), PROTOCOL_VERSION_TAG];
  const full: EventTemplate = {
    kind: template.kind,
    created_at: template.created_at ?? Math.floor(Date.now() / 1000),
    content: template.content,
    tags,
  };
  const signed = finalizeEvent(full, sk);
  const relays = loadRelays();
  // publish() returns a promise per relay; success on any one is enough.
  getPool().publish(relays, signed);
  return signed;
}

/** Subscribe to matching events. Returns an unsubscribe function. */
export function subscribe(
  filter: Filter,
  onEvent: (e: Event) => void,
  onEose?: () => void,
): () => void {
  const relays = loadRelays();
  const sub = getPool().subscribeMany(relays, filter, {
    onevent: onEvent,
    oneose: onEose,
  });
  return () => sub.close();
}
