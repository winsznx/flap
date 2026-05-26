"use client";

import { useEffect, useState } from "react";
import { useStacksSession } from "./useStacksSession";

const STACKS_API =
  process.env.NEXT_PUBLIC_STACKS_API ?? "https://api.hiro.so";

type Result = {
  balanceMicroStx: bigint;
  loading: boolean;
  error: string | null;
};

/**
 * Pull the connected wallet's STX balance from the Hiro API. Defaults to
 * testnet so the dApp doesn't need mainnet STX for the demo flow.
 */
export function useStxBalance(): Result {
  const { address, isConnected } = useStacksSession();
  const [state, setState] = useState<Result>({
    balanceMicroStx: 0n,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!isConnected || !address) {
      setState({ balanceMicroStx: 0n, loading: false, error: null });
      return;
    }
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    fetch(`${STACKS_API}/extended/v1/address/${address}/balances`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data: { stx?: { balance?: string } }) => {
        if (cancelled) return;
        const raw = data.stx?.balance ?? "0";
        setState({ balanceMicroStx: BigInt(raw), loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : String(err);
        setState({ balanceMicroStx: 0n, loading: false, error: msg });
      });

    return () => {
      cancelled = true;
    };
  }, [address, isConnected]);

  return state;
}

export function formatStx(microStx: bigint, decimals = 2): string {
  const stx = Number(microStx) / 1_000_000;
  return stx.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}
