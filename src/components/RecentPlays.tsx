"use client";

import { useMemo } from "react";
import { formatUnits } from "viem";
import {
  useAccount,
  useChainId,
  useConfig,
  useReadContracts,
  useWriteContract,
} from "wagmi";
import { getPublicClient } from "wagmi/actions";
import { useQuery } from "@tanstack/react-query";
import { flapAbi } from "@/lib/abi/flap";
import { FLAP_ADDRESS, isFlapDeployed } from "@/lib/wagmi";

const LOOKBACK = 200_000n;

type PlayTuple = readonly [
  player: `0x${string}`,
  stake: bigint,
  startedAt: bigint,
  score: bigint,
  state: number,
];

const STATE_LABEL = ["None", "Open", "Settled", "Cancelled"] as const;

/**
 * Indexes PlayOpened events for the connected wallet and surfaces the live
 * state of each play. Rows where `state === Open` AND `score > 0` get an
 * inline Settle button — permissionless so anyone could trigger it, but the
 * player is the one most motivated.
 */
export function RecentPlays() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const config = useConfig();

  const idsQuery = useQuery({
    queryKey: ["flap-recent-plays", chainId, address],
    queryFn: async (): Promise<bigint[]> => {
      if (!address) return [];
      const client = getPublicClient(config, { chainId });
      if (!client) return [];
      const head = await client.getBlockNumber();
      const from = head > LOOKBACK ? head - LOOKBACK : 0n;
      const eventAbi = flapAbi.find(
        (i) => i.type === "event" && i.name === "PlayOpened",
      ) as Extract<(typeof flapAbi)[number], { type: "event"; name: "PlayOpened" }>;
      const logs = await client.getLogs({
        address: FLAP_ADDRESS,
        event: eventAbi,
        args: { player: address },
        fromBlock: from,
        toBlock: head,
      });
      const seen = new Set<string>();
      const out: bigint[] = [];
      for (const l of logs) {
        const id = l.args.playId;
        if (typeof id !== "bigint") continue;
        const key = id.toString();
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(id);
      }
      return out;
    },
    enabled: isConnected && isFlapDeployed && !!address,
    refetchInterval: 60_000,
  });

  const ids = idsQuery.data ?? [];

  const { data: results, refetch } = useReadContracts({
    contracts: ids.map((id) => ({
      abi: flapAbi,
      address: FLAP_ADDRESS,
      functionName: "getPlay" as const,
      args: [id] as const,
    })),
    query: { enabled: ids.length > 0, refetchInterval: 30_000 },
  });

  const rows = useMemo(() => {
    if (!ids.length || !results) return [];
    return ids
      .map((id, idx) => {
        const r = results[idx];
        if (!r || r.status !== "success") return null;
        const p = r.result as unknown as PlayTuple;
        return {
          id,
          stake: p[1],
          score: p[3],
          state: p[4],
        };
      })
      .filter(Boolean) as Array<{ id: bigint; stake: bigint; score: bigint; state: number }>;
  }, [ids, results]);

  const { writeContract, isPending } = useWriteContract();

  if (!isFlapDeployed) {
    return (
      <p className="text-sm text-slate-text">
        Flap contract not configured. Recent plays will index once it goes live.
      </p>
    );
  }
  if (!isConnected) {
    return <p className="text-sm text-slate-text">Connect a wallet to see your plays.</p>;
  }
  if (idsQuery.isLoading) {
    return <p className="text-sm text-slate-text font-mono">scanning recent plays…</p>;
  }
  if (rows.length === 0) {
    return (
      <p className="text-sm text-slate-text">
        No plays yet. Hit Stake &amp; play on /play.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-steel-gray/50 rounded-xl border border-steel-gray overflow-hidden bg-white">
      {rows
        .sort((a, b) => Number(b.id - a.id))
        .map((p) => {
          const stakeStr = Number(formatUnits(p.stake, 18)).toFixed(2);
          const scoreStr = p.score === 0n ? "—" : p.score.toString();
          const stateLabel = STATE_LABEL[p.state] ?? "?";
          const canSettle = p.state === 1 && p.score > 0n;
          return (
            <li
              key={p.id.toString()}
              className="px-4 py-3 flex items-center justify-between gap-4 text-sm"
            >
              <div className="flex items-center gap-4 flex-wrap">
                <span className="font-mono text-slate-text w-12">#{p.id.toString()}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest ${
                    stateLabel === "Open"
                      ? "bg-action-orange/10 text-action-orange"
                      : stateLabel === "Settled"
                        ? "bg-success-moss/10 text-success-moss"
                        : "bg-fog-gray text-slate-text"
                  }`}
                >
                  {stateLabel}
                </span>
                <span className="font-mono text-slate-text">${stakeStr} staked</span>
                <span className="font-mono text-ink-blue">score {scoreStr}</span>
              </div>
              {canSettle && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    writeContract(
                      {
                        abi: flapAbi,
                        address: FLAP_ADDRESS,
                        functionName: "settlePlay",
                        args: [p.id],
                      },
                      { onSuccess: () => refetch() },
                    );
                  }}
                  className="text-[11px] uppercase tracking-widest text-action-orange hover:text-action-orange/80 font-mono disabled:opacity-40"
                >
                  settle →
                </button>
              )}
            </li>
          );
        })}
    </ul>
  );
}
