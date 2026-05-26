"use client";

/**
 * v8 wrapper. Uses the new `connect()` / `disconnect()` / `isConnected()` /
 * `getLocalStorage()` surface so we don't have to keep an `AppConfig` +
 * `UserSession` instance around.
 */
type ConnectModule = typeof import("@stacks/connect");

let _mod: Promise<ConnectModule> | null = null;
function getMod(): Promise<ConnectModule> {
  if (!_mod) _mod = import("@stacks/connect");
  return _mod;
}

export type StacksSessionState = {
  isConnected: boolean;
  address: string | null;
};

export function readStacksSession(): StacksSessionState {
  if (typeof window === "undefined") return { isConnected: false, address: null };
  try {
    const raw = window.localStorage.getItem("blockstack-session");
    if (!raw) return { isConnected: false, address: null };
    const data: { addresses?: { stx?: { address?: string }[] } } = JSON.parse(raw);
    const stx = data.addresses?.stx?.[0]?.address;
    if (stx) return { isConnected: true, address: stx };
  } catch {
    /* ignore */
  }
  return { isConnected: false, address: null };
}

export async function connectStacks(): Promise<void> {
  const mod = await getMod();
  await mod.connect();
}

export async function disconnectStacks(): Promise<void> {
  const mod = await getMod();
  try {
    mod.disconnect();
  } catch {
    /* best effort */
  }
  try {
    window.localStorage.removeItem("blockstack-session");
  } catch {
    /* ignore */
  }
}
