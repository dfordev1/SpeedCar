# SpeedCar Protocol (v0)

SpeedCar defines a set of Nostr event kinds that together describe the
lifecycle of a peer-to-peer ride. Any client that speaks these events is a
conformant SpeedCar client.

All events are standard [NIP-01](https://github.com/nostr-protocol/nips/blob/master/01.md)
Nostr events: `{ id, pubkey, created_at, kind, tags, content, sig }`.

Sensitive content (rider name, drop-off address, trip details) is encrypted
per [NIP-44](https://github.com/nostr-protocol/nips/blob/master/44.md) to the
counterparty's pubkey. Discovery events (driver presence, open ride requests)
are public so they are queryable.

## Kind range

We use the **application-specific** parameterized-replaceable and ephemeral
ranges to avoid clashing with other Nostr applications:

- `30078` → application-specific replaceable: profile (NIP-78 convention)
- `27000` → ephemeral: driver presence heartbeat
- `27001` → ephemeral: rider ride request (open call)
- `27002` → ephemeral: driver offer to a rider request
- `27003` → ephemeral: rider acceptance of an offer
- `27004` → ephemeral: trip state update (started / arrived / completed / cancelled)
- `27005` → ephemeral: WebRTC signalling payload (SDP / ICE)
- `1986`  → regular: signed review (post-trip, persistent)

Ephemeral kinds (20000–29999) are not stored long-term by well-behaved relays;
that matches our needs — presence and matching are transient.

## Event shapes

All shapes below show `tags` and `content`. `content` is a JSON string unless
noted; encrypted content is NIP-44 ciphertext.

### `30078` — SpeedCar profile (replaceable)

```
tags:   [["d", "speedcar-profile"], ["role", "rider" | "driver" | "both"]]
content: JSON (public) {
  "name": "Ada",
  "avatar": "<optional url or data uri>",
  "vehicle": { "make": "...", "model": "...", "plate": "..." }  // drivers only
}
```

### `27000` — Driver presence (ephemeral)

Published every 20–30s while driver is online.

```
tags: [
  ["g", "<geohash 6 chars>"],          // coarse location bucket
  ["expiration", "<unix ts now + 60>"] // NIP-40
]
content: JSON (public) {
  "lat": 12.9716, "lng": 77.5946,
  "heading": 180, "speedKph": 0,
  "seats": 3
}
```

Queried by riders with a filter like
`{ kinds: [27000], "#g": ["<geohash>", ...neighbors] }`.

### `27001` — Ride request (ephemeral)

Rider broadcasts an open call.

```
tags: [
  ["g", "<geohash 6 chars>"],          // pickup bucket
  ["expiration", "<unix ts now + 120>"]
]
content: JSON (public) {
  "requestId": "<uuid>",
  "pickup":  { "lat": ..., "lng": ..., "label": "..." },
  "dropoff": { "lat": ..., "lng": ..., "label": "..." },
  "paxCount": 1,
  "notes": "<optional>"
}
```

### `27002` — Driver offer (ephemeral, directed)

Driver responds to a specific ride request.

```
tags: [
  ["p", "<rider pubkey>"],
  ["e", "<ride-request event id>"],
  ["expiration", "<unix ts now + 60>"]
]
content: NIP-44 encrypted JSON {
  "requestId": "...",
  "etaSeconds": 240,
  "fareHint": { "currency": "INR", "amount": 120, "note": "fuel split" },
  "driver": { "name": "...", "vehicle": { ... }, "rating": 4.8 }
}
```

### `27003` — Rider acceptance (ephemeral, directed)

Rider picks one offer. Signals start of trip coordination.

```
tags: [
  ["p", "<driver pubkey>"],
  ["e", "<offer event id>"],
  ["expiration", "<unix ts now + 60>"]
]
content: NIP-44 encrypted JSON {
  "requestId": "...",
  "webrtcOffer": { /* SDP */ }   // optional, can be sent via 27005 instead
}
```

### `27004` — Trip state update (ephemeral, directed, both ways)

```
tags: [
  ["p", "<counterparty pubkey>"],
  ["e", "<offer or acceptance event id>"]
]
content: NIP-44 encrypted JSON {
  "requestId": "...",
  "state": "en_route_pickup" | "arrived_pickup" |
           "in_progress"     | "arrived_dropoff" |
           "completed"       | "cancelled",
  "reason": "<optional string>",
  "at": <unix ts>
}
```

Once the WebRTC channel is up, this is a fallback — live updates flow P2P.

### `27005` — WebRTC signalling (ephemeral, directed)

```
tags: [["p", "<counterparty pubkey>"]]
content: NIP-44 encrypted JSON {
  "type": "offer" | "answer" | "ice",
  "payload": { /* SDP or ICE candidate */ }
}
```

### `1986` — Trip review (regular, persistent)

Posted after `completed`. Public and signed — this is the reputation layer.

```
tags: [
  ["p", "<reviewed pubkey>"],
  ["e", "<acceptance event id>"],
  ["l", "speedcar-review"],
  ["rating", "5"]   // 1..5
]
content: JSON (public) {
  "comment": "<optional>",
  "role": "rider" | "driver"    // who is being reviewed
}
```

## WebRTC once connected

After the data channel opens, rider and driver exchange:

- `loc` messages: `{ t: "loc", lat, lng, heading, ts }` at 1 Hz
- `msg` messages: `{ t: "msg", text, ts }` for chat
- `state` messages: mirror of `27004` so both sides agree

Nothing about ongoing location goes through relays — it is pure P2P.

## Discovery scope: geohash buckets

Drivers tag presence with a 6-character geohash (~1.2 km cell). Riders query
their own cell plus the 8 neighbors. This bounds relay queries to small result
sets without needing server-side geo indexing.

For sparser areas, clients may widen to 5-char geohashes (~5 km). Clients MUST
NOT query with no geohash — that would trawl the entire relay network.

## Versioning

This is **v0**. Breaking changes allowed. Any event produced by a client
SHOULD include a tag `["speedcar", "v0"]` so future versions can filter.

When v1 lands: bump to `["speedcar", "v1"]`, update kind numbers if needed,
ship a migration note.
