"use client";

import {
  useAccount,
  useReadContract,
  useReadContracts,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { flapAbi } from "@/lib/abi/flap";
import { FLAP_ADDRESS, isFlapDeployed } from "@/lib/wagmi";

const STREAK_MILESTONES = [7, 14, 30, 100] as const;

/**
 * Live on-chain reads for the connected wallet's Flap state — current
 * play-streak, day of last play, and which streak badges they've already
 * claimed. Renders alongside the localStorage stats that already exist on
 * the profile page so the user sees both their session data and their
 * permanent on-chain progress in one place.
 */
export function OnchainProfile() {
  const { address, isConnected } = useAccount();

  const enabled = isConnected && isFlapDeployed && !!address;

  const { data: streakRaw } = useReadContract({
    abi: flapAbi,
    address: FLAP_ADDRESS,
    functionName: "playStreak",
    args: address ? [address] : undefined,
    query: { enabled, refetchInterval: 60_000 },
  });

  const { data: lastDayRaw } = useReadContract({
    abi: flapAbi,
    address: FLAP_ADDRESS,
    functionName: "lastPlayDay",
    args: address ? [address] : undefined,
    query: { enabled, refetchInterval: 60_000 },
  });

  const { data: todayRaw } = useReadContract({
    abi: flapAbi,
    address: FLAP_ADDRESS,
    functionName: "today",
    query: { enabled: isFlapDeployed, refetchInterval: 60_000 },
  });

  const badges = useReadContracts({
    contracts: STREAK_MILESTONES.map((m) => ({
      abi: flapAbi,
      address: FLAP_ADDRESS,
      functionName: "claimedStreakAt" as const,
      args: address ? [address, m] : ([address!, m] as const),
    })),
    query: { enabled, refetchInterval: 60_000 },
  });

  const { writeContract, data: claimHash, isPending: claimSigning, variables: claimVars, reset: resetClaim } =
    useWriteContract();
  const { isLoading: claimMining, isSuccess: claimConfirmed } = useWaitForTransactionReceipt({
    hash: claimHash,
  });

  function claim(milestone: number) {
    if (!isConnected || !isFlapDeployed) return;
    writeContract({
      abi: flapAbi,
      address: FLAP_ADDRESS,
      functionName: "claimStreakBadge",
      args: [milestone],
    });
  }

  const pendingMilestone =
    claimSigning || claimMining
      ? (claimVars?.args?.[0] as number | undefined)
      : undefined;

  const streak = streakRaw !== undefined ? Number(streakRaw) : 0;
  const lastDay = lastDayRaw !== undefined ? Number(lastDayRaw) : 0;
  const today = todayRaw !== undefined ? Number(todayRaw) : 0;
  const streakActiveToday = lastDay === today && lastDay > 0;
  const streakStaleDays = lastDay > 0 ? Math.max(0, today - lastDay) : 0;

  return (
    <div className="card-surface px-6 py-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[16px] font-semibold text-ink-blue">On-chain</h3>
        <span className="text-[11px] text-slate-text font-mono uppercase tracking-widest">
          {isFlapDeployed ? "live" : "contract offline"}
        </span>
      </div>

      {!isConnected ? (
        <p className="text-[13px] text-slate-text">Connect a wallet to see your on-chain streak.</p>
      ) : !isFlapDeployed ? (
        <p className="text-[13px] text-slate-text">
          The Flap contract isn&apos;t deployed yet — your streak will start the moment it goes live.
        </p>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Stat
              label="Current streak"
              value={`${streak} day${streak === 1 ? "" : "s"}`}
              hint={
                streak === 0
                  ? "no plays yet"
                  : streakActiveToday
                    ? "settled today ✓"
                    : streakStaleDays === 1
                      ? "play today to keep it"
                      : `broken (${streakStaleDays}d gap)`
              }
            />
            <Stat
              label="Last play"
              value={
                lastDay === 0
                  ? "—"
                  : streakStaleDays === 0
                    ? "today"
                    : streakStaleDays === 1
                      ? "yesterday"
                      : `${streakStaleDays} days ago`
              }
              hint={`unix day ${lastDay}`}
            />
          </div>

          <div>
            <div className="text-[11px] text-slate-text font-mono uppercase tracking-widest mb-2">
              Streak badges
            </div>
            <div className="flex gap-2 flex-wrap">
              {STREAK_MILESTONES.map((m, idx) => {
                const claimed =
                  badges.data?.[idx]?.status === "success"
                    ? (badges.data[idx].result as boolean)
                    : false;
                const earned = streak >= m;
                const pending = pendingMilestone === m;

                if (claimed) {
                  return (
                    <span
                      key={m}
                      className="px-3 py-1 rounded-full text-[12px] font-mono bg-success-moss/15 text-success-moss border border-success-moss/40"
                      title="minted"
                    >
                      {m}d ✓
                    </span>
                  );
                }

                if (earned) {
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => claim(m)}
                      disabled={pending || claimSigning || claimMining}
                      className="px-3 py-1 rounded-full text-[12px] font-mono bg-action-orange/15 text-action-orange border border-action-orange/40 hover:bg-action-orange/25 disabled:opacity-50"
                      title="Mint your streak badge — soulbound, sticks to this wallet forever."
                    >
                      {pending ? `${m}d minting…` : `${m}d — claim →`}
                    </button>
                  );
                }

                return (
                  <span
                    key={m}
                    className="px-3 py-1 rounded-full text-[12px] font-mono bg-fog-gray text-slate-text border border-steel-gray"
                    title="not yet earned"
                  >
                    {m}d
                  </span>
                );
              })}
            </div>

            {claimHash && (
              <div className="mt-2 flex items-center gap-3 text-[11px] font-mono text-slate-text">
                <span>
                  tx <span className="text-ink-blue">{claimHash.slice(0, 10)}…</span>
                </span>
                {claimConfirmed && (
                  <span className="text-success-moss">badge minted ✓</span>
                )}
                <button type="button" onClick={() => resetClaim()} className="underline">
                  reset
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div>
      <div className="text-[11px] text-slate-text font-mono uppercase tracking-widest">{label}</div>
      <div className="text-[22px] font-semibold text-ink-blue mt-1">{value}</div>
      <div className="text-[11px] text-slate-text mt-0.5">{hint}</div>
    </div>
  );
}
