"use client";

import { useState } from "react";
import { formatUnits } from "viem";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { flapAbi } from "@/lib/abi/flap";
import { FLAP_ADDRESS, isFlapDeployed } from "@/lib/wagmi";

/**
 * Yesterday's bounty claim panel.
 *
 * Reads today() from the contract, computes yesterday's index, and surfaces:
 *   - the pool size for that day
 *   - whether it's been finalized yet (owner-only one-shot)
 *   - whether the connected wallet is the day's top scorer
 *   - the claim button (gated on finalized && top-player && not yet claimed)
 *
 * Anyone can pull this view; only the top scorer can submit `claimDailyBounty`.
 */
export function ClaimBountyPanel() {
  const { address, isConnected } = useAccount();
  const [phase, setPhase] = useState<"idle" | "claiming">("idle");

  const { data: todayIdx } = useReadContract({
    abi: flapAbi,
    address: FLAP_ADDRESS,
    functionName: "today",
    query: { enabled: isFlapDeployed, refetchInterval: 60_000 },
  });

  const yesterdayIdx = typeof todayIdx === "bigint" && todayIdx > 0n ? todayIdx - 1n : undefined;

  const { data: ledger } = useReadContract({
    abi: flapAbi,
    address: FLAP_ADDRESS,
    functionName: "getDay",
    args: yesterdayIdx !== undefined ? [yesterdayIdx] : undefined,
    query: { enabled: isFlapDeployed && yesterdayIdx !== undefined, refetchInterval: 30_000 },
  });

  const { writeContract, data: hash, isPending, reset } = useWriteContract();
  const { isLoading: mining, isSuccess } = useWaitForTransactionReceipt({ hash });

  const pool = ledger?.bountyPool ?? 0n;
  const top = ledger?.topPlayer ?? "0x0000000000000000000000000000000000000000";
  const finalized = ledger?.finalized ?? false;
  const claimed = ledger?.bountyClaimed ?? false;

  const isTop = !!address && top.toLowerCase() === address.toLowerCase();
  const canClaim =
    isConnected && isFlapDeployed && finalized && !claimed && isTop && !mining && !isPending;

  function claim() {
    if (yesterdayIdx === undefined) return;
    setPhase("claiming");
    writeContract({
      abi: flapAbi,
      address: FLAP_ADDRESS,
      functionName: "claimDailyBounty",
      args: [yesterdayIdx],
    });
  }

  const cta = mining
    ? "Claiming…"
    : isSuccess
      ? "Claimed ✓"
      : !isConnected
        ? "Connect to check"
        : !isFlapDeployed
          ? "Contract not deployed"
          : !finalized
            ? "Day not finalized yet"
            : claimed
              ? "Already claimed"
              : !isTop
                ? "Not yesterday's top scorer"
                : "Claim bounty";

  const poolStr = `$${Number(formatUnits(pool, 18)).toFixed(2)}`;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Yesterday&apos;s bounty</h3>
        <span className="text-[11px] uppercase tracking-widest text-slate-500 font-mono">
          DAY {yesterdayIdx !== undefined ? yesterdayIdx.toString() : "—"}
        </span>
      </div>

      <ul className="text-sm space-y-1.5">
        <li className="flex justify-between">
          <span className="text-slate-500">Pool</span>
          <span className="font-medium text-slate-900">{poolStr}</span>
        </li>
        <li className="flex justify-between">
          <span className="text-slate-500">Status</span>
          <span className={`font-medium ${finalized ? "text-emerald-600" : "text-amber-600"}`}>
            {!isFlapDeployed
              ? "—"
              : finalized
                ? claimed
                  ? "claimed"
                  : "claimable"
                : "awaiting finalize"}
          </span>
        </li>
        <li className="flex justify-between">
          <span className="text-slate-500">Top scorer</span>
          <span className="font-mono text-slate-900 text-xs">
            {top === "0x0000000000000000000000000000000000000000"
              ? "—"
              : `${top.slice(0, 6)}…${top.slice(-4)}`}
          </span>
        </li>
      </ul>

      <button
        type="button"
        onClick={claim}
        disabled={!canClaim}
        className="w-full px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium disabled:opacity-40"
      >
        {cta}
      </button>

      {hash && (
        <div className="flex justify-between items-center text-xs text-slate-500">
          <span>tx: {hash.slice(0, 10)}…</span>
          <button type="button" onClick={() => reset()} className="underline">
            reset
          </button>
        </div>
      )}

      <p className="text-xs text-slate-500">
        The day&apos;s pool finalizes once owner calls <code className="font-mono">finalizeDay</code>.
        Only the top scorer can pull it; everyone else sees the same panel for transparency.
      </p>
    </div>
  );
}
