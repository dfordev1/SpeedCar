import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  createIdentity as createIdentityFn,
  forgetIdentity as forgetIdentityFn,
  importIdentity as importIdentityFn,
  loadIdentity,
  type Identity,
} from "../nostr/identity";

interface IdentityState {
  identity: Identity | null;
  create: () => Identity;
  importKey: (input: string) => Identity;
  forget: () => void;
}

const Ctx = createContext<IdentityState | null>(null);

export function IdentityProvider({ children }: { children: React.ReactNode }) {
  const [identity, setIdentity] = useState<Identity | null>(null);

  useEffect(() => {
    setIdentity(loadIdentity());
  }, []);

  const value = useMemo<IdentityState>(
    () => ({
      identity,
      create: () => {
        const id = createIdentityFn();
        setIdentity(id);
        return id;
      },
      importKey: (input: string) => {
        const id = importIdentityFn(input);
        setIdentity(id);
        return id;
      },
      forget: () => {
        forgetIdentityFn();
        setIdentity(null);
      },
    }),
    [identity],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useIdentity(): IdentityState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useIdentity must be used inside IdentityProvider");
  return ctx;
}
