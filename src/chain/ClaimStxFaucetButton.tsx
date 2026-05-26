"use client";

import { useState } from "react";
import { useStacksSession } from "./useStacksSession";

const FAUCET_CONTRACT =
  process.env.NEXT_PUBLIC_STACKS_FAUCET_CONTRACT ?? "SP000000000000000000002Q6VF78.stx-faucet";

/**
 * Calls the stx-faucet `claim` function via @stacks/connect v8's `request`
 * RPC. v8 dropped `openContractCall` + the Network classes — now you pass a
 * string literal network and call `request('stx_callContract', ...)`.
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
      const { request } = await import("@stacks/connect");
      const response = await request("stx_callContract", {
        contract: FAUCET_CONTRACT as `${string}.${string}`,
        functionName: "claim",
        functionArgs: [],
        network: "mainnet",
      });
      setTxId((response as { txid?: string }).txid ?? null);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={onClick}
        disabled={!isConnected || pending}
        className="rounded-full border border-current px-4 py-2 text-sm disabled:opacity-50"
      >
        {pending ? "Sign in wallet..." : "Claim STX from faucet"}
      </button>
      {txId && (
        <div className="mt-2 text-xs font-mono opacity-70">
          tx: {txId.slice(0, 12)}...
        </div>
      )}
      {err && <div className="mt-2 text-xs font-mono text-rose-600">{err}</div>}
    </div>
  );
}
