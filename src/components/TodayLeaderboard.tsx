"use client";

import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import { useChainId, useConfig, useReadContract } from "wagmi";
import { getPublicClient } from "wagmi/actions";
import { flapAbi } from "@/lib/abi/flap";
import { FLAP_ADDRESS, isFlapDeployed } from "@/lib/wagmi";

const LOOKBACK = 50_000n;

type Row = {
  player: `0x${string}`;
  won: boolean;
  payout: bigint;
  block: bigint;
};

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

/**
 * Pulls PlaySettled events from the last ~50k blocks and shows them ranked by
 * payout for the current unix-day bucket. Anything older is dropped — we keep
 * the focus on what's chasing today's pool.
 */
export function TodayLeaderboard() {
  const chainId = useChainId();
  const config = useConfig();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const { data: today } = useReadContract({
    abi: flapAbi,
    address: FLAP_ADDRESS,
    functionName: "today",
    query: { enabled: isFlapDeployed, refetchInterval: 60_000 },
  });

  useEffect(() => {
    if (!isFlapDeployed) {
      setRows(null);
      return;
    }

    let cancelled = false;
    setErr(null);

    (async () => {
      try {
        const client = getPublicClient(config, { chainId });
        if (!client) return;
        const head = await client.getBlockNumber();
        const from = head > LOOKBACK ? head - LOOKBACK : 0n;

        const eventAbi = flapAbi.find(
          (i) => i.type === "event" && i.name === "PlaySettled",
        ) as Extract<(typeof flapAbi)[number], { type: "event"; name: "PlaySettled" }>;

        const logs = await client.getLogs({
          address: FLAP_ADDRESS,
          event: eventAbi,
          fromBlock: from,
          toBlock: head,
        });

        const collected: Row[] = logs
          .filter((l) => l.args.won === true)
          .map((l) => ({
            player: l.args.player ?? ("0x0" as `0x${string}`),
            won: true,
            payout: l.args.payout ?? 0n,
            block: l.blockNumber,
          }))
          .sort((a, b) => Number(b.payout - a.payout));

        if (!cancelled) setRows(collected);
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : String(e));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chainId, config, today]);

  if (!isFlapDeployed) {
    return (
      <p className="text-sm text-slate-500">
        Flap contract not configured yet — leaderboard goes live on deploy.
      </p>
    );
  }
  if (err) {
    return <p className="text-sm text-amber-600">Could not load leaderboard: {err}</p>;
  }
  if (rows === null) {
    return <p className="text-sm text-slate-500 font-mono">scanning recent settlements…</p>;
  }
  if (rows.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No winners yet today. Beat the threshold for 2× your stake.
      </p>
    );
  }

  return (
    <ol className="space-y-2">
      {rows.slice(0, 10).map((r, idx) => (
        <li
          key={`${r.player}-${r.block}`}
          className="flex items-center justify-between bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-sm"
        >
          <span className="flex items-center gap-3">
            <span className="font-mono text-slate-500 w-6 text-right">#{idx + 1}</span>
            <span className="font-mono text-slate-900">{short(r.player)}</span>
          </span>
          <span className="font-mono text-emerald-600 font-semibold">
            +${Number(formatUnits(r.payout, 18)).toFixed(2)}
          </span>
        </li>
      ))}
    </ol>
  );
}
