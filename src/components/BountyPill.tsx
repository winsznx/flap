"use client";

import { formatUnits } from "viem";
import { useReadContract } from "wagmi";
import { flapAbi } from "@/lib/abi/flap";
import { FLAP_ADDRESS, isFlapDeployed } from "@/lib/wagmi";

/**
 * Live read of today's bounty pool. Shown in the play header so players can
 * see what they're chasing.
 */
export function BountyPill() {
  const { data: today } = useReadContract({
    abi: flapAbi,
    address: FLAP_ADDRESS,
    functionName: "today",
    query: { enabled: isFlapDeployed, refetchInterval: 60_000 },
  });

  const { data: ledger } = useReadContract({
    abi: flapAbi,
    address: FLAP_ADDRESS,
    functionName: "getDay",
    args: today ? [today] : undefined,
    query: { enabled: isFlapDeployed && today !== undefined, refetchInterval: 30_000 },
  });

  if (!isFlapDeployed) {
    return (
      <div className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-500 text-xs font-medium">
        Bounty pool: —
      </div>
    );
  }

  const pool = ledger ? formatUnits(ledger.bountyPool, 18) : "0";
  const dollars = Number(pool).toFixed(2);

  return (
    <div className="px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium">
      Today&apos;s bounty: <span className="text-slate-900 font-semibold">${dollars}</span>
    </div>
  );
}
