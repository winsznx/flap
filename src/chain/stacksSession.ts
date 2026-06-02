"use client";

/**
 * Stacks wallet session. Uses @stacks/connect v8 dynamically so the package
 * only lands in the browser chunk that needs it — keeps the Cloudflare worker
 * server bundle clean and under the 3 MiB cap.
 */

const STORAGE_KEY = "blockstack-session";

export type StacksSessionState = {
  isConnected: boolean;
  address: string | null;
};

export function readStacksSession(): StacksSessionState {
  if (typeof window === "undefined") return { isConnected: false, address: null };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { isConnected: false, address: null };
    const data: {
      addresses?: { stx?: { address?: string }[] };
      userData?: { profile?: { stxAddress?: { mainnet?: string } } };
    } = JSON.parse(raw);
    const stx = data.addresses?.stx?.[0]?.address ?? data.userData?.profile?.stxAddress?.mainnet;
    if (stx) return { isConnected: true, address: stx };
  } catch {
    /* malformed payload — treat as disconnected */
  }
  return { isConnected: false, address: null };
}

export async function connectStacks(): Promise<StacksSessionState> {
  if (typeof window === "undefined") return { isConnected: false, address: null };

  const existing = readStacksSession();
  if (existing.isConnected) return existing;

  const mod = await import("@stacks/connect");
  const fn = (mod as unknown as { connect?: (opts: unknown) => Promise<unknown> }).connect;
  if (typeof fn === "function") {
    const result = (await fn({
      appDetails: { name: "Flap", icon: `${window.location.origin}/icon.svg` },
    })) as { addresses?: { stx?: { address?: string }[] } } | undefined;
    const stx = result?.addresses?.stx?.[0]?.address;
    if (stx) {
      writeSession(stx);
      return { isConnected: true, address: stx };
    }
  }
  return readStacksSession();
}

export async function disconnectStacks(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const mod = await import("@stacks/connect");
    const fn = (mod as unknown as { disconnect?: () => void }).disconnect;
    if (typeof fn === "function") fn();
  } catch {
    /* dynamic import may fail offline — fall back to local clear */
  }
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

function writeSession(stxAddress: string): void {
  try {
    const payload = JSON.stringify({ addresses: { stx: [{ address: stxAddress }] } });
    window.localStorage.setItem(STORAGE_KEY, payload);
  } catch {
    /* ignore */
  }
}
