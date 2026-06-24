"use client";

import { useState } from "react";
import { formatUnits } from "viem";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { useChainKind } from "@/chain/ChainProvider";
import { CeloOnlyNotice } from "@/components/CeloOnlyNotice";
import { flapAbi } from "@/lib/abi/flap";
import { FLAP_ADDRESS, isFlapDeployed } from "@/lib/wagmi";

// getPlay's ABI output is a single tuple with named components, so viem
// decodes the result as an OBJECT (not a positional array). Reading it via
// play[0]/play[1]/play[3]/play[4] yields undefined and silently disables the
// Cancel CTA for every real user.
type Play = {
  player: `0x${string}`;
  stake: bigint;
  startedAt: bigint;
  score: bigint;
  state: number;
};

/**
 * Refund a still-Open play if the score hasn't been reported yet. Useful when
 * the scorer is down or the player closed the tab mid-game and just wants the
 * stake back. The contract enforces the full gating (msg.sender == player,
 * state == Open, score == 0) — we surface the exact reason inline so the user
 * doesn't sign a doomed tx.
 */
export function CancelPlayButton() {
  const { kind } = useChainKind();

  const { address, isConnected } = useAccount();
  const [playId, setPlayId] = useState("");

  const idBn = (() => {
    try {
      const n = BigInt(playId);
      return n >= 0n ? n : -1n;
    } catch {
      return -1n;
    }
  })();
  const validId = idBn >= 0n;

  const { data: playData } = useReadContract({
    abi: flapAbi,
    address: FLAP_ADDRESS,
    functionName: "getPlay",
    args: validId ? [idBn] : undefined,
    query: { enabled: validId && isFlapDeployed && isConnected, refetchInterval: 30_000 },
  });

  const play = playData as Play | undefined;

  const { writeContract, data: hash, isPending, reset, error: writeError } =
    useWriteContract();
  const { isLoading: mining, isSuccess: confirmed } = useWaitForTransactionReceipt({ hash });

  const isPlayer = play && address ? play.player.toLowerCase() === address.toLowerCase() : false;
  const state = play?.state ?? -1;
  const score = play?.score ?? 0n;
  const stake = play?.stake ?? 0n;
  const stakeStr = stake > 0n ? Number(formatUnits(stake, 18)).toFixed(2) : "—";

  const eligible =
    validId && isConnected && isFlapDeployed && isPlayer && state === 1 && score === 0n;

  function submit() {
    if (!eligible) return;
    writeContract({
      abi: flapAbi,
      address: FLAP_ADDRESS,
      functionName: "cancelPlay",
      args: [idBn],
    });
  }

  const reason = (() => {
    if (!isFlapDeployed) return "Flap contract not deployed yet.";
    if (!isConnected) return "Connect a wallet to cancel a play.";
    if (!validId) return "Enter a play id.";
    if (!play || play.player === "0x0000000000000000000000000000000000000000") return "Play not found.";
    if (!isPlayer) return "Only the player who staked can cancel.";
    if (state !== 1) return state === 2 ? "Play already settled." : "Play already cancelled.";
    if (score > 0n) return "Score already reported — settle from /play instead.";
    return null;
  })();

  if (kind === "stacks") {
    return <CeloOnlyNotice feature="Cancel Play" />;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-900">Cancel play</span>
        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">
          pre-score only
        </span>
      </div>

      <input
        type="number"
        inputMode="numeric"
        min={0}
        value={playId}
        onChange={(e) => setPlayId(e.target.value)}
        placeholder="play id" aria-label="Play id"
        className="w-full font-mono text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900"
      />

      {reason ? (
        <p className="text-xs text-slate-500">{reason}</p>
      ) : (
        <p className="text-xs text-emerald-600">
          Eligible — full ${stakeStr} stake returns to your wallet.
        </p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={!eligible || mining || isPending}
        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium disabled:opacity-40"
      >
        {mining ? "Mining…" : isPending ? "Waiting for wallet…" : "Cancel & refund stake"}
      </button>

      {hash && (
        <div className="text-xs text-slate-500 flex items-center gap-2">
          <a
            href={`https://celoscan.io/tx/${hash}`}
            target="_blank"
            rel="noreferrer"
            className="text-action-orange underline"
          >
            view tx ↗ <span className="font-mono">({hash.slice(0, 10)}…)</span>
          </a>
          {confirmed && <span className="text-emerald-600">refunded ✓</span>}
          <button type="button" onClick={() => reset()} className="ml-auto underline">
            reset
          </button>
        </div>
      )}
      {writeError && (
        <p className="text-xs text-red-600">{writeError.message.split("\n")[0]}</p>
      )}
    </div>
  );
}
