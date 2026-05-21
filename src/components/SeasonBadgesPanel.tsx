"use client";

import { useState } from "react";
import {
  useAccount,
  useReadContract,
  useReadContracts,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { flapAbi } from "@/lib/abi/flap";
import { FLAP_ADDRESS, isFlapDeployed } from "@/lib/wagmi";

type SeasonTuple = readonly [startedAt: bigint, endsAt: bigint, finalized: boolean];

const PARTICIPATION_THRESHOLD = 5;

/**
 * Claim podium + participation badges for a finalized season. The contract
 * gates each kind separately so we probe both eligibility tracks and surface
 * which (or both) the connected wallet can claim. Once a badge is minted the
 * row tips over to a ✓ chip and the button disables.
 */
export function SeasonBadgesPanel() {
  const { address, isConnected } = useAccount();
  const [seasonId, setSeasonId] = useState("");

  const idBn = (() => {
    try {
      const n = BigInt(seasonId);
      return n > 0n ? n : -1n;
    } catch {
      return -1n;
    }
  })();
  const validId = idBn > 0n;

  const { data: seasonData } = useReadContract({
    abi: flapAbi,
    address: FLAP_ADDRESS,
    functionName: "seasons",
    args: validId ? [idBn] : undefined,
    query: { enabled: validId && isFlapDeployed, refetchInterval: 60_000 },
  });
  const season = seasonData as SeasonTuple | undefined;

  const probes = useReadContracts({
    contracts:
      validId && address
        ? ([
            {
              abi: flapAbi,
              address: FLAP_ADDRESS,
              functionName: "seasonRank",
              args: [idBn, address],
            },
            {
              abi: flapAbi,
              address: FLAP_ADDRESS,
              functionName: "seasonPlays",
              args: [idBn, address],
            },
            {
              abi: flapAbi,
              address: FLAP_ADDRESS,
              functionName: "claimedPodium",
              args: [idBn, address],
            },
            {
              abi: flapAbi,
              address: FLAP_ADDRESS,
              functionName: "claimedParticipation",
              args: [idBn, address],
            },
          ] as const)
        : [],
    query: { enabled: validId && isFlapDeployed && !!address, refetchInterval: 30_000 },
  });

  const rank = (probes.data?.[0]?.result as number | undefined) ?? 0;
  const plays = (probes.data?.[1]?.result as number | undefined) ?? 0;
  const claimedPodium = (probes.data?.[2]?.result as boolean | undefined) ?? false;
  const claimedParticipation = (probes.data?.[3]?.result as boolean | undefined) ?? false;

  const finalized = season?.[2] ?? false;
  const seasonExists = season ? season[0] > 0n : false;

  const podiumEarned = rank > 0 && !claimedPodium && finalized;
  const participationEarned = plays >= PARTICIPATION_THRESHOLD && !claimedParticipation && finalized;

  const {
    writeContract,
    data: hash,
    isPending,
    variables: pendingArgs,
    reset,
  } = useWriteContract();
  const { isLoading: mining, isSuccess: confirmed } = useWaitForTransactionReceipt({ hash });

  function claim(kind: "podium" | "participation") {
    if (!isConnected || !isFlapDeployed || !validId) return;
    writeContract({
      abi: flapAbi,
      address: FLAP_ADDRESS,
      functionName: kind === "podium" ? "claimPodiumBadge" : "claimParticipationBadge",
      args: [idBn],
    });
  }

  const pendingKind =
    isPending || mining
      ? pendingArgs?.functionName === "claimPodiumBadge"
        ? "podium"
        : pendingArgs?.functionName === "claimParticipationBadge"
          ? "participation"
          : undefined
      : undefined;

  const seasonStatus = (() => {
    if (!isFlapDeployed) return "Flap contract not deployed yet.";
    if (!isConnected) return "Connect a wallet to check season badges.";
    if (!validId) return "Enter the finalized season id you want to claim from.";
    if (!seasonExists) return "Season not found.";
    if (!finalized) return "Season hasn't been finalized yet — badges unlock after finalize.";
    return null;
  })();

  return (
    <div className="card-surface px-6 py-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[16px] font-semibold text-ink-blue">Season badges</h3>
        <span className="text-[11px] text-slate-text font-mono uppercase tracking-widest">
          podium top-10 · participation 5+ plays
        </span>
      </div>

      <input
        type="number"
        inputMode="numeric"
        min={1}
        value={seasonId}
        onChange={(e) => setSeasonId(e.target.value)}
        placeholder="season id"
        className="w-full font-mono text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900"
      />

      {seasonStatus ? (
        <p className="text-xs text-slate-text">{seasonStatus}</p>
      ) : (
        <>
          <BadgeRow
            label="Podium"
            detail={rank > 0 ? `Rank #${rank}` : "Not ranked this season"}
            claimed={claimedPodium}
            earned={podiumEarned}
            pending={pendingKind === "podium"}
            onClaim={() => claim("podium")}
            disabled={mining || isPending}
          />
          <BadgeRow
            label="Participation"
            detail={`${plays} play${plays === 1 ? "" : "s"} this season`}
            claimed={claimedParticipation}
            earned={participationEarned}
            pending={pendingKind === "participation"}
            onClaim={() => claim("participation")}
            disabled={mining || isPending}
          />
        </>
      )}

      {hash && (
        <div className="text-xs text-slate-text flex items-center gap-2 font-mono">
          tx <span className="text-ink-blue">{hash.slice(0, 10)}…</span>
          {confirmed && <span className="text-success-moss">minted ✓</span>}
          <button type="button" onClick={() => reset()} className="ml-auto underline">
            reset
          </button>
        </div>
      )}
    </div>
  );
}

function BadgeRow({
  label,
  detail,
  claimed,
  earned,
  pending,
  onClaim,
  disabled,
}: {
  label: string;
  detail: string;
  claimed: boolean;
  earned: boolean;
  pending: boolean;
  onClaim: () => void;
  disabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-t border-steel-gray/50 first:border-t-0">
      <div>
        <div className="text-sm font-medium text-ink-blue">{label}</div>
        <div className="text-xs text-slate-text">{detail}</div>
      </div>
      {claimed ? (
        <span className="px-3 py-1 rounded-full text-[12px] font-mono bg-success-moss/15 text-success-moss border border-success-moss/40">
          minted ✓
        </span>
      ) : earned ? (
        <button
          type="button"
          onClick={onClaim}
          disabled={disabled}
          className="px-3 py-1.5 rounded-full text-[12px] font-mono bg-action-orange/15 text-action-orange border border-action-orange/40 hover:bg-action-orange/25 disabled:opacity-50"
        >
          {pending ? "minting…" : "claim →"}
        </button>
      ) : (
        <span className="px-3 py-1 rounded-full text-[12px] font-mono bg-fog-gray text-slate-text border border-steel-gray">
          not earned
        </span>
      )}
    </div>
  );
}
