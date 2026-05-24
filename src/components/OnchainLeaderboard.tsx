"use client";

import { useMemo } from "react";
import { useConfig } from "wagmi";
import { getPublicClient } from "wagmi/actions";
import { useQuery } from "@tanstack/react-query";
import { celo } from "wagmi/chains";
import { flapAbi } from "@/lib/abi/flap";
import { FLAP_ADDRESS, isFlapDeployed } from "@/lib/wagmi";
import { fetchActorAggregates, formatCusd, shortAddr, type ActorEvent } from "@/lib/leaderboard";

const ACTOR_EVENTS: ActorEvent[] = [
  { name: "PlayOpened", actorArg: "player", valueArg: "stake" },
  { name: "ScoreReported", actorArg: "player" },
  { name: "PlaySettled", actorArg: "player", valueArg: "payout" },
  { name: "PlayCancelled", actorArg: "player" },
  { name: "BountySponsored", actorArg: "sponsor", valueArg: "amount" },
  { name: "DayFinalized", actorArg: "top" },
  { name: "BountyClaimed", actorArg: "claimer", valueArg: "amount" },
  { name: "Hopped", actorArg: "player" },
  { name: "IntroducerSet", actorArg: "player" },
  { name: "PodiumBadgeMinted", actorArg: "player" },
  { name: "ParticipationBadgeMinted", actorArg: "player" },
  { name: "StreakBadgeMinted", actorArg: "player" },
];

const PAGE_SIZE = 25;

export function OnchainLeaderboard() {
  const config = useConfig();

  const query = useQuery({
    queryKey: ["flap-leaderboard-alltime", celo.id, FLAP_ADDRESS],
    queryFn: async () => {
      const client = getPublicClient(config, { chainId: celo.id });
      if (!client) return [];
      return fetchActorAggregates({
        client,
        address: FLAP_ADDRESS,
        abi: flapAbi,
        events: ACTOR_EVENTS,
      });
    },
    enabled: isFlapDeployed,
    refetchInterval: 90_000,
    staleTime: 60_000,
  });

  const rows = useMemo(() => query.data ?? [], [query.data]);
  const top = useMemo(() => rows.slice(0, PAGE_SIZE), [rows]);
  const totalActions = useMemo(() => rows.reduce((s, r) => s + r.actions, 0), [rows]);
  const totalVolume = useMemo(() => rows.reduce((s, r) => s + r.valueWei, 0n), [rows]);

  if (!isFlapDeployed) {
    return (
      <div className="surface-elevated rounded-lg p-12 text-center">
        <p className="font-mono text-sm" style={{ color: "var(--color-slate-text)" }}>Flap contract not deployed on this network.</p>
      </div>
    );
  }

  return (
    <div>
      <StatStrip uau={rows.length} actions={totalActions} volume={totalVolume} loading={query.isLoading} />

      <div className="mt-8 surface-elevated rounded-lg overflow-hidden">
        <div
          className="grid items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 border-b"
          style={{
            background: "var(--color-fog-gray)",
            borderColor: "var(--color-steel-gray)",
            gridTemplateColumns: "44px 1fr 72px 140px 96px",
          }}
        >
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.15em] font-mono" style={{ color: "var(--color-slate-text)" }}>Rank</span>
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.15em] font-mono" style={{ color: "var(--color-slate-text)" }}>Pilot</span>
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.15em] font-mono text-right" style={{ color: "var(--color-slate-text)" }}>Actions</span>
          <span className="hidden sm:block text-[11px] uppercase tracking-[0.15em] font-mono text-right" style={{ color: "var(--color-slate-text)" }}>cUSD volume</span>
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.15em] font-mono text-right" style={{ color: "var(--color-slate-text)" }}>Block</span>
        </div>

        {query.isLoading ? (
          <div className="px-6 py-16 text-center">
            <p className="font-mono text-xs uppercase tracking-widest" style={{ color: "var(--color-slate-text)" }}>Indexing on-chain events…</p>
          </div>
        ) : top.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-mono text-xs uppercase tracking-widest" style={{ color: "var(--color-slate-text)" }}>No on-chain activity yet.</p>
          </div>
        ) : (
          <ul>
            {top.map((row, idx) => (
              <li
                key={row.address}
                className="grid items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 border-b last:border-b-0 transition-colors hover:bg-[var(--color-fog-gray)]"
                style={{
                  borderColor: "var(--color-steel-gray)",
                  gridTemplateColumns: "44px 1fr 72px 140px 96px",
                }}
              >
                <RankCell rank={idx + 1} />
                <AddressCell address={row.address} breakdown={row.eventBreakdown} />
                <div className="text-right font-semibold text-base tabular-nums" style={{ color: "var(--color-ink-blue)" }}>{row.actions}</div>
                <div className="hidden sm:block text-right text-sm font-mono tabular-nums" style={{ color: "var(--color-slate-text)" }}>{formatCusd(row.valueWei)}</div>
                <div className="text-right text-xs font-mono tabular-nums" style={{ color: "var(--color-slate-text)" }}>#{row.lastBlock.toString()}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {rows.length > PAGE_SIZE && (
        <p className="mt-4 text-[11px] font-mono text-center uppercase tracking-widest" style={{ color: "var(--color-slate-text)" }}>
          Top {PAGE_SIZE} of {rows.length} pilots · ranked by on-chain actions
        </p>
      )}

      {query.dataUpdatedAt > 0 && (
        <p className="mt-2 text-[11px] font-mono text-center uppercase tracking-widest" style={{ color: "var(--color-slate-text)" }}>
          Indexed {new Date(query.dataUpdatedAt).toLocaleTimeString()} · refreshes every 90s
        </p>
      )}
    </div>
  );
}

function StatStrip({ uau, actions, volume, loading }: {
  uau: number; actions: number; volume: bigint; loading: boolean;
}) {
  const stats = [
    { label: "PILOTS", value: loading ? "…" : uau.toString() },
    { label: "ACTIONS", value: loading ? "…" : actions.toString() },
    { label: "cUSD VOLUME", value: loading ? "…" : formatCusd(volume) },
    { label: "NETWORK", value: "CELO" },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-lg px-4 sm:px-6 py-5 sm:py-6 surface-elevated"
        >
          <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.15em] font-mono" style={{ color: "var(--color-slate-text)" }}>{s.label}</div>
          <div className="mt-2 text-2xl sm:text-3xl md:text-[32px] font-semibold leading-tight tabular-nums" style={{ color: "var(--color-ink-blue)" }}>{s.value}</div>
        </div>
      ))}
    </div>
  );
}

function RankCell({ rank }: { rank: number }) {
  const color = rank === 1
    ? "var(--color-action-orange)"
    : rank <= 3
    ? "var(--color-ink-blue)"
    : "var(--color-slate-text)";
  return (
    <div className="text-sm font-bold font-mono tabular-nums" style={{ color }}>
      {rank.toString().padStart(2, "0")}
    </div>
  );
}

function AddressCell({ address, breakdown }: { address: string; breakdown: Record<string, number> }) {
  const top3 = Object.entries(breakdown).sort((a, b) => b[1] - a[1]).slice(0, 3);
  return (
    <div className="min-w-0">
      <a
        href={`https://celoscan.io/address/${address}`}
        target="_blank"
        rel="noreferrer"
        className="text-sm font-semibold font-mono block truncate transition-colors"
        style={{ color: "var(--color-ink-blue)" }}
      >
        {shortAddr(address)}
      </a>
      <div className="mt-1 hidden sm:flex items-center gap-1.5 flex-wrap">
        {top3.map(([name, count]) => (
          <span
            key={name}
            className="text-[9px] uppercase tracking-[0.08em] font-mono px-1.5 py-0.5 rounded"
            style={{
              background: "var(--color-fog-gray)",
              color: "var(--color-slate-text)",
              border: "1px solid var(--color-steel-gray)",
            }}
          >
            {name} <span className="font-semibold" style={{ color: "var(--color-ink-blue)" }}>{count}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
