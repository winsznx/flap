"use client";

import { useEffect, useState } from "react";
import { useStacksSession } from "./useStacksSession";

const STACKS_API = process.env.NEXT_PUBLIC_STACKS_API ?? "https://api.hiro.so";

type Result = {
  balanceMicroStx: bigint;
  loading: boolean;
  error: string | null;
};

/**
 * STX balance via Hiro's v2 endpoint:
 *   /extended/v2/addresses/{addr}/balances/stx -> { balance, locked, ... }
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

    fetch(`${STACKS_API}/extended/v2/addresses/${address}/balances/stx`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data: unknown) => {
        if (cancelled) return;
        // Validate the shape — a 200 with an unexpected body (e.g. an error
        // JSON wrapped in 200) would otherwise silently fall through to
        // BigInt("0"), surfacing as 0 STX with error=null and misleading the
        // user about their balance.
        const balance =
          data && typeof data === "object" && "balance" in data
            ? (data as { balance?: unknown }).balance
            : undefined;
        if (typeof balance !== "string" || !/^\d+$/.test(balance)) {
          setState({
            balanceMicroStx: 0n,
            loading: false,
            error: "unexpected hiro response shape",
          });
          return;
        }
        setState({
          balanceMicroStx: BigInt(balance),
          loading: false,
          error: null,
        });
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
