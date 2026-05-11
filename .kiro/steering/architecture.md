# SpeedCar — Architecture

SpeedCar is a **decentralized rideshare protocol**, not a centrally-operated
service. There is no SpeedCar backend. There is no SpeedCar database. There is
no SpeedCar company account that anything depends on.

The goals this architecture is optimized for, in priority order:

1. **Zero operating cost, forever**, at any scale.
2. **Unlimited horizontal scale** — every new user adds capacity, not load.
3. **No single point of failure** owned by us.
4. **Open protocol** — anyone can build a compatible client.

## The shape

```
       Rider device                     Driver device
     ┌──────────────┐                 ┌──────────────┐
     │ SpeedCar PWA │◄── WebRTC ─────►│ SpeedCar PWA │
     └──────┬───────┘   (P2P direct)  └──────┬───────┘
            │                                │
            │    signalling + discovery      │
            └────────────┬───────────────────┘
                         ▼
            ┌─────────────────────────────┐
            │  Public Nostr relay network │
            │  (we run none of these)     │
            └─────────────────────────────┘
```

## Component decisions (locked)

| Layer | Choice | Notes |
|---|---|---|
| Identity | Nostr keypair (secp256k1) generated on device | No signup server. Key IS the account. |
| Discovery + signalling | Public Nostr relays | We publish to, never host. See `relays.md`. |
| Realtime transport | WebRTC data channels | Direct P2P once matched. |
| NAT traversal | Public STUN servers (Google, Cloudflare) | Free, unlimited. |
| Map display | MapLibre GL JS | Free, open-source map SDK. |
| Map tiles | PMTiles, bundled or hosted on GitHub Pages | Single file, HTTP range requests, no tile server. |
| Routing | Valhalla / GraphHopper on-device | Ship regional routing graph, route locally. |
| Turn-by-turn nav | Deep link to Google / Apple Maps | Do not reimplement. |
| Reputation | Signed Nostr events (reviews) | Verifiable, decentralized. |
| Payments | Out-of-band (cash / Venmo / UPI / Lightning) | Optional Lightning integration later. |
| App distribution | PWA on GitHub Pages (primary), IPFS (mirror) | Installable, offline-capable. |
| Background location (drivers) | Capacitor Android wrapper, same codebase | iOS stays PWA; we accept the limitation. |

## What we will NEVER add

These are architecture-level commitments. If we ever need one of these, we've
betrayed the goal and should rename the project:

- Our own backend server
- Our own database
- SMS/phone OTP (paid)
- Stripe or any payment processor we operate
- An auth provider (Supabase Auth, Auth0, Clerk, Cognito)
- A paid map/tile/routing API
- Cloud infrastructure billed to us (AWS, GCP, Azure)

## What we will add, cautiously

- Our own Nostr relay (optional mirror, must not be required by clients)
- A self-hosted tile/PMTiles mirror (optional; default is bundled + GitHub Pages)
- A help/docs site (static, on GitHub Pages)

## Repo layout

```
SpeedCar/
├── .kiro/steering/         architecture + protocol + costs docs
├── apps/
│   └── web/                the PWA (Vite + React + TS)
├── packages/
│   ├── protocol/           Nostr event kinds, schemas, helpers
│   └── shared/             types and utilities shared app <-> protocol
├── .github/workflows/      CI + GitHub Pages deploy
└── README.md
```

Monorepo is pnpm workspaces. Keep it flat; do not add more packages until the
current ones outgrow their file.

## Mobile strategy

- **MVP**: one PWA. Riders use it as-is. Drivers install it to home screen.
- **When drivers need background location**: wrap the same codebase with
  Capacitor, ship an Android APK directly (no Play Store required), keep iOS
  on PWA.
- **Never two separate apps.** One codebase, two runtime shells at most.

## Scaling story

This is the key insight: **we do not scale.** The Nostr relay network does.
WebRTC does. Users' devices do. Every additional user brings their own CPU,
bandwidth, and screen. Our hosted surface area is a static PWA, which is
free to serve on GitHub Pages up to ludicrous scale.

If GitHub Pages ever rate-limits us, we mirror to IPFS, Cloudflare Pages,
Netlify, Vercel, user self-hosting — the PWA is ~1 MB of static assets.
