# Zero-cost rules

Every change to SpeedCar is checked against these rules. If a proposed change
breaks one, it does not ship until either the rule is explicitly revised in
this file, or the change is reshaped to comply.

1. **No infra we pay for.** No cloud accounts billed to the project. No "free
   tier" that turns into a bill if we succeed. Our hosting bill at 100 users
   and 100 million users must both be $0.

2. **No service we operate.** Nothing a user depends on must be controlled by
   us. If our GitHub account vanished tomorrow, a user who already has the
   app on their phone should still be able to hail a ride.

3. **No per-request external API calls we pay for.** Maps, geocoding,
   routing, SMS, payments, push — all must be free-forever or fully on-device
   or peer-to-peer.

4. **No lock-in.** Every piece of our stack must have a free, open-source
   replacement we can swap to. No proprietary SDK that holds data hostage.

5. **Static-only distribution.** The PWA ships as static files. No server-side
   rendering, no API routes, no edge functions. `index.html` + JS + assets.

6. **User-owned data.** All user data lives on the user's device and on public
   Nostr relays. We have no "user database" to leak, sell, or subpoena.

7. **Clients over services.** Every time there is a choice between "put this
   on a server" vs "put this in the client", we put it in the client.

## The test

Before merging, ask:

- Does this add a recurring cost? → reject
- Does this require a service only we can operate? → reject
- Does this hold user data outside the user's device or public relays? → reject
- Does this break if GitHub Pages is down? → PWA already installed must still work

If all four are "no", ship it.
