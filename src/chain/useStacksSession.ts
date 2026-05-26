"use client";

import { useEffect, useState } from "react";
import { useChainKind } from "./ChainProvider";
import { readStacksSession, type StacksSessionState } from "./stacksSession";

/**
 * Reactive read of the Stacks connection state. Re-checks every 2s when the
 * Stacks chain is active so the UI catches connect/disconnect from the
 * @stacks/connect modal without us having to wire a custom event bus.
 */
export function useStacksSession(): StacksSessionState {
  const { kind } = useChainKind();
  const [state, setState] = useState<StacksSessionState>({ isConnected: false, address: null });

  useEffect(() => {
    if (kind !== "stacks") {
      setState({ isConnected: false, address: null });
      return;
    }
    const tick = () => setState(readStacksSession());
    const initial = window.setTimeout(tick, 0);
    const interval = window.setInterval(tick, 2000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(interval);
    };
  }, [kind]);

  return state;
}
