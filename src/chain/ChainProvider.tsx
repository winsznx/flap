"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { type ChainKind, parseChainKind } from "./chainKinds";

const STORAGE_KEY = "flap_chain_kind";

type ChainState = {
  kind: ChainKind;
  setKind: (kind: ChainKind) => void;
};

const ChainContext = createContext<ChainState | null>(null);

export function ChainProvider({ children }: { children: React.ReactNode }) {
  // SSR returns "celo" so the server tree never depends on localStorage —
  // then we hydrate the saved value in a post-mount effect. This avoids the
  // React 19 hydration mismatch warning and the flash-of-wrong-chain.
  const [kind, setKindState] = useState<ChainKind>("celo");

  useEffect(() => {
    try {
      const saved = parseChainKind(window.localStorage.getItem(STORAGE_KEY));
      if (saved && saved !== "celo") setKindState(saved);
    } catch {
      /* localStorage may throw in private mode — fall through to celo */
    }
  }, []);

  const setKind = (next: ChainKind) => {
    setKindState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  };

  const value = useMemo<ChainState>(() => ({ kind, setKind }), [kind]);
  return <ChainContext.Provider value={value}>{children}</ChainContext.Provider>;
}

export function useChainKind(): ChainState {
  const ctx = useContext(ChainContext);
  if (!ctx) throw new Error("useChainKind must be used inside <ChainProvider />");
  return ctx;
}

