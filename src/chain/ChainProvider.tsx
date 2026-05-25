"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { type ChainKind, parseChainKind } from "./chainKinds";

const STORAGE_KEY = "flap_chain_kind";

type ChainState = {
  kind: ChainKind;
  setKind: (kind: ChainKind) => void;
};

const ChainContext = createContext<ChainState | null>(null);

export function ChainProvider({ children }: { children: React.ReactNode }) {
  const [kind, setKindState] = useState<ChainKind>(() => {
    if (typeof window === "undefined") return "celo";
    try {
      const saved = parseChainKind(window.localStorage.getItem(STORAGE_KEY));
      return saved ?? "celo";
    } catch {
      return "celo";
    }
  });

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

