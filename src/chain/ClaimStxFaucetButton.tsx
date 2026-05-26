"use client";

import { useState } from "react";
import { useStacksSession } from "./useStacksSession";

const FAUCET_CONTRACT =
  process.env.NEXT_PUBLIC_STACKS_FAUCET_CONTRACT ?? "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.stx-faucet";

/**
 * Triggers the stx-faucet `claim` function via @stacks/connect's
 * openContractCall. Lazy-imports so the @stacks bundle stays out of the
 * Celo-only path.
 */
export function ClaimStxFaucetButton({ className = "" }: { className?: string }) {
  const { isConnected } = useStacksSession();
  const [pending, setPending] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onClick() {
    if (!isConnected) return;
    setPending(true);
    setErr(null);
    try {
      const [{ openContractCall }, { STACKS_MAINNET }] = await Promise.all([
        import("@stacks/connect"),
        import("@stacks/network"),
      ]);
      const [contractAddress, contractName] = FAUCET_CONTRACT.split(".");
      if (!contractAddress || !contractName) {
        throw new Error("FAUCET_CONTRACT must be 'address.name'");
      }
      await openContractCall({
        network: STACKS_MAINNET,
        contractAddress,
        contractName,
        functionName: "claim",
        functionArgs: [],
        onFinish: (data: { txId: string }) => {
          setTxId(data.txId);
          setPending(false);
        },
        onCancel: () => {
          setPending(false);
        },
      });
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
      setPending(false);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={onClick}
        disabled={!isConnected || pending}
        className="btn-ghost min-h-0 px-4 py-2 text-sm disabled:opacity-50"
      >
        {pending ? "Sign in wallet…" : "Claim STX from faucet"}
      </button>
      {txId && (
        <div className="mt-2 text-mono text-xs text-[var(--text-tertiary)]">
          tx: {txId.slice(0, 10)}…
        </div>
      )}
      {err && <div className="mt-2 text-mono text-xs text-rose-600">{err}</div>}
    </div>
  );
}
