"use client";

import { formatUnits } from "viem";
import { useReadContract } from "wagmi";
import { useChainKind } from "@/chain/ChainProvider";
import { flapAbi } from "@/lib/abi/flap";
import { FLAP_ADDRESS, isFlapDeployed } from "@/lib/wagmi";

/**
 * Live read of today's bounty pool. Shown in the play header so players can
 * see what they're chasing. Stacks today doesn't carry a daily bounty pool
 * (only daily-hop + start-play landed), so we render a neutral pill.
 */
export function BountyPill() {
  const { kind } = useChainKind();
  const onCelo = kind === "celo";

  const { data: today } = useReadContract({
    abi: flapAbi,
    address: FLAP_ADDRESS,
    functionName: "today",
    query: { enabled: onCelo && isFlapDeployed, refetchInterval: 60_000 },
  });

  // `today` returns 0n on a fresh deployment — that's a valid day index, not
  // "missing". Gate on `!== undefined` rather than truthiness so the bounty
  // read still fires for day 0.
  const { data: ledger } = useReadContract({
    abi: flapAbi,
    address: FLAP_ADDRESS,
    functionName: "getDay",
    args: today !== undefined ? [today] : undefined,
    query: {
      enabled: onCelo && isFlapDeployed && today !== undefined,
      refetchInterval: 30_000,
    },
  });

  if (!onCelo) {
    return (
      <div className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-500 text-xs font-medium">
        Bounty pool: Celo only
      </div>
    );
  }

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
