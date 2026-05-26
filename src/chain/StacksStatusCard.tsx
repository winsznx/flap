"use client";

import { useChainKind } from "./ChainProvider";
import { useStacksSession } from "./useStacksSession";
import { formatStx, useStxBalance } from "./useStxBalance";

/**
 * Drops in beside the regular Celo widgets — only renders when the user has
 * toggled to the Stacks kind. Shows wallet, balance, network, deploy state.
 */
export function StacksStatusCard() {
  const { kind } = useChainKind();
  const { isConnected, address } = useStacksSession();
  const { balanceMicroStx, loading, error } = useStxBalance();

  if (kind !== "stacks") return null;

  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
      <div className="flex items-center justify-between">
        <span className="text-mono text-[11px] uppercase tracking-[0.15em] text-[var(--text-tertiary)]">
          Stacks · testnet
        </span>
        <span
          aria-hidden
          className={`h-2 w-2 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-stone-400"}`}
        />
      </div>
      {isConnected && address ? (
        <>
          <div className="mt-3 text-mono text-sm text-[var(--text-primary)]">
            {address.slice(0, 8)}…{address.slice(-6)}
          </div>
          <div className="mt-2 text-2xl font-semibold tabular-nums text-[var(--text-primary)]">
            {loading ? "…" : `${formatStx(balanceMicroStx)} STX`}
          </div>
          {error && (
            <div className="mt-1 text-mono text-xs text-rose-600">{error}</div>
          )}
        </>
      ) : (
        <>
          <div className="mt-3 text-sm text-[var(--text-secondary)]">
            Toggle Stacks in the nav and connect to see your STX balance + interact with the Clarity contracts.
          </div>
        </>
      )}
    </div>
  );
}
