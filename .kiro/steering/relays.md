# Nostr relays

SpeedCar clients MUST publish to and subscribe from multiple public Nostr
relays. Relays are chosen for: liberal write policy, good uptime, global
distribution, and no paywalls.

## Default relay pool

The PWA ships with this pool as the default. Users can add/remove relays in
settings.

- `wss://relay.damus.io`
- `wss://relay.primal.net`
- `wss://nos.lol`
- `wss://relay.nostr.band`
- `wss://nostr.wine`
- `wss://relay.snort.social`

## Policy

- Publish every outgoing event to **all** configured relays. Deduplication is
  the consumer's job (by event id).
- Subscribe to at least **3** relays simultaneously for any given query.
- If a relay rejects or closes, drop it for the session and continue with the
  rest. Never block on a single relay.
- NEVER hardcode a SpeedCar-operated relay as required. If we ever run a relay
  it is an optional additional entry only.

## Failure modes, by design

If the entire default pool were blocked, users can manually add any other
public Nostr relay and continue. There are hundreds listed at
[nostr.watch](https://nostr.watch).
