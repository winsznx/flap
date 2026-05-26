"use client";

/**
 * Stacks session shim. @stacks/connect was removed from deps to keep the
 * Cloudflare worker under the 3 MiB size limit. We read the wallet's
 * localStorage key directly and open the Hiro web wallet for connect.
 * Once the worker is on a paid plan (10 MiB) flip this file back to the
 * dynamic `await import('@stacks/connect')` path.
 */

export type StacksSessionState = {
  isConnected: boolean;
  address: string | null;
};

const STORAGE_KEY = "blockstack-session";

export function readStacksSession(): StacksSessionState {
  if (typeof window === "undefined") return { isConnected: false, address: null };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { isConnected: false, address: null };
    const data: { addresses?: { stx?: { address?: string }[] } } = JSON.parse(raw);
    const stx = data.addresses?.stx?.[0]?.address;
    if (stx) return { isConnected: true, address: stx };
  } catch {
    /* malformed payload — treat as disconnected */
  }
  return { isConnected: false, address: null };
}

export async function connectStacks(): Promise<void> {
  if (typeof window === "undefined") return;
  window.open("https://wallet.hiro.so/", "_blank", "noopener,noreferrer");
}

export async function disconnectStacks(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
