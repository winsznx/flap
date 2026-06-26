"use client";

import { useEffect, useState } from "react";
import { useChainKind } from "./ChainProvider";
import { readStacksSession, type StacksSessionState } from "./stacksSession";

/**
 * Reactive read of the Stacks connection state.
 *
 * The @stacks/connect modal writes the session to localStorage on
 * connect/disconnect. We listen for:
 *
 *   - `storage` events (cross-tab connects/disconnects fire here for free)
 *   - `visibilitychange` + `focus` (catches the in-modal flow when the user
 *     comes back from the wallet tab)
 *   - a low-rate poll (every 10s) as the long-tail safety net for same-tab
 *     writes that don't fire any event
 *
 * Replaces the previous 2s busy-poll — 5× less CPU + RPC noise while still
 * reflecting wallet-side disconnects within a few seconds.
 */
export function useStacksSession(): StacksSessionState {
  const { kind } = useChainKind();
  const [state, setState] = useState<StacksSessionState>({ isConnected: false, address: null });

  useEffect(() => {
    let cancelled = false;
    const sync = (next: StacksSessionState) => {
      if (!cancelled) setState(next);
    };

    if (kind !== "stacks") {
      const id = window.setTimeout(() => sync({ isConnected: false, address: null }), 0);
      return () => {
        cancelled = true;
        window.clearTimeout(id);
      };
    }
    const tick = () => sync(readStacksSession());
    const initial = window.setTimeout(tick, 0);

    const onStorage = (e: StorageEvent) => {
      // Both the v8 canonical key and the legacy blockstack-session key get
      // watched so we react to either path.
      if (e.key === "@stacks/connect" || e.key === "blockstack-session" || e.key === null) {
        tick();
      }
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", tick);
    document.addEventListener("visibilitychange", onVisible);
    const interval = window.setInterval(tick, 10_000);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", tick);
      document.removeEventListener("visibilitychange", onVisible);
      window.clearTimeout(initial);
      window.clearInterval(interval);
      cancelled = true;
    };
  }, [kind]);

  return state;
}
