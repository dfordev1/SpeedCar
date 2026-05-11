# SpeedCar

**A zero-cost, decentralized rideshare protocol.**

No servers. No database. No accounts. No fees. No company.

SpeedCar is not a service — it's a protocol defined on top of
[Nostr](https://nostr.com) and [WebRTC](https://webrtc.org). Any client that
speaks the protocol (see [`.kiro/steering/protocol.md`](./.kiro/steering/protocol.md))
can hail a ride to any driver running a compatible client. This repo ships one
such client as a PWA.

## Status

**Phase 1 / v0.** Scaffolding, identity, relay plumbing, map, role screens.
Ride requests, driver presence, and WebRTC trips come in the next phase.

## How it works

```
Rider device                    Driver device
    │                                │
    │◄──── WebRTC (P2P direct) ─────►│
    │                                │
    └─── Nostr (discovery only) ─────┘
                   │
                   ▼
    Public Nostr relays (we run none)
```

- **Identity** is a Nostr keypair generated in your browser. The key *is* the
  account. No signup server. No password. Back up your `nsec` — if you lose it
  there is no recovery.
- **Discovery** (driver presence, ride requests, offers) happens on public
  Nostr relays. The protocol uses ephemeral event kinds so nothing is stored
  long-term.
- **The actual trip** — live location, chat, ETA — runs peer-to-peer over
  WebRTC. Nothing goes through our servers, because there are none.
- **Maps** are MapLibre GL with OSM tiles for MVP. Production clients will
  bundle a [PMTiles](https://protomaps.com/) file for offline use.
- **Routing** will be done on-device with
  [Valhalla](https://github.com/valhalla/valhalla). Turn-by-turn navigation
  is delegated to the OS map app via deep link.

## Non-goals

Things SpeedCar will **never** ship:

- A backend server we operate
- A database we operate
- Paid SMS, paid maps, paid routing
- Any auth provider
- Stripe / payments we run

See [`.kiro/steering/zero-cost.md`](./.kiro/steering/zero-cost.md) for the
ground rules every change is measured against.

## Repo layout

```
apps/
  web/                  Vite + React + TS PWA (the client)
packages/
  protocol/             Nostr event kinds, content schemas
  shared/               Types, geohash, haversine
.kiro/
  steering/             Architecture, protocol, relay, zero-cost docs
.github/
  workflows/            CI + GitHub Pages deploy
```

## Local development

Prereqs: Node 20+, pnpm 9+.

```
pnpm install
pnpm dev        # starts the PWA at http://localhost:5173
pnpm typecheck
pnpm build
```

## Deploying

Pushing to `main` triggers `.github/workflows/deploy.yml` which builds the
PWA and publishes it to GitHub Pages. That is the entire infrastructure.

To enable it the first time, in your GitHub repo settings enable Pages with
source "GitHub Actions". No other configuration.

## Contributing

Read the steering files first:

- [`architecture.md`](./.kiro/steering/architecture.md) — the shape
- [`protocol.md`](./.kiro/steering/protocol.md) — the event kinds
- [`relays.md`](./.kiro/steering/relays.md) — default relay pool
- [`zero-cost.md`](./.kiro/steering/zero-cost.md) — the non-negotiables

## License

TBD. MIT or AGPL — leaning AGPL to keep forks open.
