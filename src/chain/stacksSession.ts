"use client";

/**
 * Stacks wallet session — built on the real @stacks/connect v8 API surface
 * (isConnected / getLocalStorage / disconnect / isStacksWalletInstalled).
 * Loads the SDK dynamically so the package only lands in the browser chunk
 * that needs it; keeps the Cloudflare worker server bundle clean.
 */

export type StacksSessionState = {
  isConnected: boolean;
  address: string | null;
};

export function readStacksSession(): StacksSessionState {
  if (typeof window === "undefined") return { isConnected: false, address: null };
  try {
    // v8 persists under "@stacks/connect" as a normal JSON object.
    // Shape: { addresses: { stx: [{ address, symbol }, ...], btc: [...] }, version }
    const raw = window.localStorage.getItem("@stacks/connect");
    if (!raw) return { isConnected: false, address: null };
    const data = JSON.parse(raw) as {
      addresses?: { stx?: { address?: string }[] };
    };
    const stx = data.addresses?.stx?.[0]?.address;
    if (stx) return { isConnected: true, address: stx };
  } catch {
    /* malformed payload — fall through */
  }
  return { isConnected: false, address: null };
}

export async function isStacksWalletAvailable(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const mod = await import("@stacks/connect");
    const check = (mod as unknown as { isStacksWalletInstalled?: () => boolean })
      .isStacksWalletInstalled;
    return typeof check === "function" ? !!check() : false;
  } catch {
    return false;
  }
}

export async function connectStacks(): Promise<StacksSessionState> {
  if (typeof window === "undefined") return { isConnected: false, address: null };

  const existing = readStacksSession();
  if (existing.isConnected) return existing;

  const mod = await import("@stacks/connect");
  const connectFn = (mod as unknown as {
    connect?: (opts?: unknown) => Promise<unknown>;
  }).connect;
  if (typeof connectFn !== "function") {
    throw new Error("@stacks/connect connect() unavailable");
  }

  // v8 connect() options: enableLocalStorage persists the session in the
  // canonical "@stacks/connect" key so isConnected()/getLocalStorage() work.
  const result = (await connectFn({
    enableLocalStorage: true,
    persistWalletSelect: true,
    forceWalletSelect: false,
  })) as { addresses?: { symbol?: string; address: string }[] } | undefined;

  // v8 returns a flat array of AddressEntry; pick the STX principal.
  const entries = result?.addresses ?? [];
  const stx =
    entries.find((e) => e.symbol === "STX")?.address ??
    entries.find((e) => e.address?.startsWith("SP") || e.address?.startsWith("ST"))?.address ??
    null;

  if (stx) return { isConnected: true, address: stx };
  return readStacksSession();
}

export async function disconnectStacks(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const mod = await import("@stacks/connect");
    const fn = (mod as unknown as { disconnect?: () => void }).disconnect;
    if (typeof fn === "function") fn();
    const clr = (mod as unknown as { clearLocalStorage?: () => void }).clearLocalStorage;
    if (typeof clr === "function") clr();
  } catch {
    /* fall through to manual clear */
  }
  try {
    window.localStorage.removeItem("@stacks/connect");
    window.localStorage.removeItem("blockstack-session"); // legacy key cleanup
  } catch {
    /* ignore */
  }
}
