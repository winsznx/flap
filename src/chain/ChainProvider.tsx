"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { type ChainKind, parseChainKind } from "./chainKinds";

const STORAGE_KEY = "flap_chain_kind";

type ChainState = {
  kind: ChainKind;
  /**
   * `true` only AFTER the first client effect has read the persisted chain
   * from localStorage. Consumers that visually differ across chains can gate
   * the "stacks" branch on `mounted` so the SSR/first-paint never flashes
   * Celo content to a return-visit Stacks user.
   */
  mounted: boolean;
  setKind: (kind: ChainKind) => void;
};

const ChainContext = createContext<ChainState | null>(null);

export function ChainProvider({ children }: { children: React.ReactNode }) {
  // SSR returns "celo" so the server tree never depends on localStorage.
  // The first client effect hydrates the saved value AND flips `mounted` so
  // chain-aware components can wait one paint before revealing Stacks UI.
  const [kind, setKindState] = useState<ChainKind>("celo");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = parseChainKind(window.localStorage.getItem(STORAGE_KEY));
      if (saved && saved !== "celo") setKindState(saved);
    } catch {
      /* localStorage may throw in private mode — fall through to celo */
    }
    setMounted(true);
  }, []);

  const setKind = (next: ChainKind) => {
    setKindState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  };

  const value = useMemo<ChainState>(() => ({ kind, mounted, setKind }), [kind, mounted]);
  return <ChainContext.Provider value={value}>{children}</ChainContext.Provider>;
}

export function useChainKind(): ChainState {
  const ctx = useContext(ChainContext);
  if (!ctx) throw new Error("useChainKind must be used inside <ChainProvider />");
  return ctx;
}
