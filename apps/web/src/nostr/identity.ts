import { generateSecretKey, getPublicKey } from "nostr-tools/pure";
import * as nip19 from "nostr-tools/nip19";

/**
 * SpeedCar identity = a Nostr secp256k1 keypair, generated and stored on
 * device. The key *is* the account. No signup, no server, no recovery flow
 * beyond "back up your nsec".
 *
 * Storage: localStorage under "speedcar:sk" as hex. This is deliberately
 * simple and deliberately not encrypted at rest. A future version can add
 * a passphrase wrapper; v0 optimizes for clarity and zero friction.
 */

const SK_KEY = "speedcar:sk";

export interface Identity {
  /** 32-byte secret key, hex. */
  skHex: string;
  /** 32-byte secret key, raw bytes (for nostr-tools APIs). */
  sk: Uint8Array;
  /** x-only public key, hex. */
  pk: string;
  /** bech32-encoded npub (shareable). */
  npub: string;
  /** bech32-encoded nsec (backup / import). */
  nsec: string;
}

function bytesToHex(bytes: Uint8Array): string {
  let out = "";
  for (const b of bytes) out += b.toString(16).padStart(2, "0");
  return out;
}

function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) throw new Error("invalid hex length");
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function fromSk(sk: Uint8Array): Identity {
  const skHex = bytesToHex(sk);
  const pk = getPublicKey(sk);
  return {
    skHex,
    sk,
    pk,
    npub: nip19.npubEncode(pk),
    nsec: nip19.nsecEncode(sk),
  };
}

/** Load the stored identity, or null if none exists yet. */
export function loadIdentity(): Identity | null {
  try {
    const hex = localStorage.getItem(SK_KEY);
    if (!hex) return null;
    return fromSk(hexToBytes(hex));
  } catch {
    return null;
  }
}

/** Generate a brand new identity and persist it. */
export function createIdentity(): Identity {
  const sk = generateSecretKey();
  const id = fromSk(sk);
  localStorage.setItem(SK_KEY, id.skHex);
  return id;
}

/** Import an existing nsec (or hex secret key) and persist it. */
export function importIdentity(input: string): Identity {
  const trimmed = input.trim();
  let sk: Uint8Array;
  if (trimmed.startsWith("nsec1")) {
    const decoded = nip19.decode(trimmed as `nsec1${string}`);
    if (decoded.type !== "nsec") throw new Error("Not an nsec");
    sk = decoded.data;
  } else if (/^[0-9a-f]{64}$/i.test(trimmed)) {
    sk = hexToBytes(trimmed.toLowerCase());
  } else {
    throw new Error("Provide an nsec1... or 64-char hex secret key");
  }
  const id = fromSk(sk);
  localStorage.setItem(SK_KEY, id.skHex);
  return id;
}

/** Wipe the identity from this device. Irrecoverable unless user has the nsec. */
export function forgetIdentity(): void {
  localStorage.removeItem(SK_KEY);
}
