"use client";

import { useEffect, useMemo, useState } from "react";
import { useConfig } from "wagmi";
import { getPublicClient } from "wagmi/actions";
import { useQuery } from "@tanstack/react-query";
import { useChainKind } from "@/chain/ChainProvider";
import { flapAbi } from "@/lib/abi/flap";
import { ACTIVE_CHAIN_ID, FLAP_ADDRESS, isFlapDeployed } from "@/lib/wagmi";
import { fetchActorAggregates, formatCusd, shortAddr, type ActorEvent } from "@/lib/leaderboard";
import {
  fetchStacksAggregates,
  shortStxAddress,
  type StacksAggregateEntry,
} from "@/lib/stacksLeaderboard";

type ChainTab = "celo" | "stacks";

const STACKS_CONTRACTS = [
  "SP31DP8F8CF2GXSZBHHHK5J6Y061744E1TNFGYWYV.flap",
  "SP31DP8F8CF2GXSZBHHHK5J6Y061744E1TNFGYWYV.flap-hop",
  "SP31DP8F8CF2GXSZBHHHK5J6Y061744E1TNFGYWYV.flap-badges",
] as const;

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

type Row = {
  address: string;
  actions: number;
  valueLabel: string;
  lastBlock: string;
  eventBreakdown: Record<string, number>;
};

export function OnchainLeaderboard() {
  const config = useConfig();
  const { kind } = useChainKind();
  const [chain, setChain] = useState<ChainTab>(kind);

  // The header NetworkSelector is the single source of truth — the in-page
  // tab follows when the header flips, but flipping the in-page tab is
  // local-only so the leaderboard doesn't silently re-route every other
  // panel on /play, /profile, etc.
  useEffect(() => {
    setChain(kind);
  }, [kind]);

  const celoQuery = useQuery({
    queryKey: ["flap-leaderboard-celo", ACTIVE_CHAIN_ID, FLAP_ADDRESS],
    queryFn: async () => {
      const client = getPublicClient(config, { chainId: ACTIVE_CHAIN_ID });
      if (!client) return [];
      return fetchActorAggregates({
        client,
        address: FLAP_ADDRESS,
        abi: flapAbi,
        events: ACTOR_EVENTS,
      });
    },
    enabled: chain === "celo" && isFlapDeployed,
    refetchInterval: 90_000,
    staleTime: 60_000,
  });

  const stacksQuery = useQuery<StacksAggregateEntry[]>({
    queryKey: ["flap-leaderboard-stacks"],
    queryFn: () => fetchStacksAggregates({ contractIds: [...STACKS_CONTRACTS], perContractLimit: 50 }),
    enabled: chain === "stacks",
    refetchInterval: 90_000,
    staleTime: 60_000,
  });

  const rows: Row[] = useMemo(() => {
    if (chain === "celo") {
      return (celoQuery.data ?? []).map((r) => ({
        address: r.address,
        actions: r.actions,
        valueLabel: formatCusd(r.valueWei),
        lastBlock: `#${r.lastBlock.toString()}`,
        eventBreakdown: r.eventBreakdown,
      }));
    }
    return (stacksQuery.data ?? []).map((r) => ({
      address: r.address,
      actions: r.actions,
      valueLabel: (Number(r.microStxMoved) / 1_000_000).toFixed(4),
      lastBlock: `#${r.lastBlock}`,
      eventBreakdown: r.eventBreakdown,
    }));
  }, [chain, celoQuery.data, stacksQuery.data]);

  const top = useMemo(() => rows.slice(0, PAGE_SIZE), [rows]);
  const totalActions = useMemo(() => rows.reduce((s, r) => s + r.actions, 0), [rows]);
  const totalValue = useMemo(() => {
    if (chain === "celo") return (celoQuery.data ?? []).reduce((s, r) => s + r.valueWei, 0n);
    return (stacksQuery.data ?? []).reduce((s, r) => s + r.microStxMoved, 0n);
  }, [chain, celoQuery.data, stacksQuery.data]);
  const isLoading = chain === "celo" ? celoQuery.isLoading : stacksQuery.isLoading;
  const dataUpdatedAt = chain === "celo" ? celoQuery.dataUpdatedAt : stacksQuery.dataUpdatedAt;

  if (chain === "celo" && !isFlapDeployed) {
    return (
      <div className="surface-elevated rounded-lg p-12 text-center">
        <p className="font-mono text-sm" style={{ color: "var(--color-slate-text)" }}>Flap contract not deployed on this network.</p>
      </div>
    );
  }

  return (
    <div>
      <ChainToggle chain={chain} onChange={setChain} />

      <div className="mt-6">
        <StatStrip
          uau={rows.length}
          actions={totalActions}
          value={totalValue}
          chain={chain}
          loading={isLoading}
        />
      </div>

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
          <span className="hidden sm:block text-[11px] uppercase tracking-[0.15em] font-mono text-right" style={{ color: "var(--color-slate-text)" }}>
            {chain === "celo" ? "cUSD volume" : "STX fees"}
          </span>
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.15em] font-mono text-right" style={{ color: "var(--color-slate-text)" }}>Block</span>
        </div>

        {isLoading ? (
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
                <AddressCell address={row.address} breakdown={row.eventBreakdown} chain={chain} />
                <div className="text-right font-semibold text-base tabular-nums" style={{ color: "var(--color-ink-blue)" }}>{row.actions}</div>
                <div className="hidden sm:block text-right text-sm font-mono tabular-nums" style={{ color: "var(--color-slate-text)" }}>{row.valueLabel}</div>
                <div className="text-right text-xs font-mono tabular-nums" style={{ color: "var(--color-slate-text)" }}>{row.lastBlock}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {rows.length > PAGE_SIZE && (
        <p className="mt-4 text-[11px] font-mono text-center uppercase tracking-widest" style={{ color: "var(--color-slate-text)" }}>
          Top {PAGE_SIZE} of {rows.length} pilots · {chain}
        </p>
      )}

      {dataUpdatedAt > 0 && (
        <p className="mt-2 text-[11px] font-mono text-center uppercase tracking-widest" style={{ color: "var(--color-slate-text)" }}>
          Indexed {new Date(dataUpdatedAt).toLocaleTimeString()} · refreshes every 90s
        </p>
      )}
    </div>
  );
}

function ChainToggle({ chain, onChange }: { chain: ChainTab; onChange: (c: ChainTab) => void }) {
  const tabs: { id: ChainTab; label: string; hint: string }[] = [
    { id: "celo", label: "Celo", hint: "cUSD events" },
    { id: "stacks", label: "Stacks", hint: "Hiro mainnet" },
  ];
  return (
    <div
      className="inline-flex rounded-full p-1"
      role="tablist"
      aria-label="Chain selector"
      style={{ background: "var(--color-fog-gray)", border: "1px solid var(--color-steel-gray)" }}
    >
      {tabs.map((t) => {
        const active = t.id === chain;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.id)}
            className="rounded-full px-4 py-1.5 text-[12px] font-mono transition-colors"
            style={{
              background: active ? "white" : "transparent",
              color: active ? "var(--color-ink-blue)" : "var(--color-slate-text)",
              boxShadow: active ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
            }}
          >
            {t.label}
            <span className="ml-2 text-[10px] opacity-60">{t.hint}</span>
          </button>
        );
      })}
    </div>
  );
}

function StatStrip({
  uau,
  actions,
  value,
  chain,
  loading,
}: {
  uau: number;
  actions: number;
  value: bigint;
  chain: ChainTab;
  loading: boolean;
}) {
  const valueLabel = chain === "celo" ? "cUSD VOLUME" : "STX FEES";
  const valueValue = loading
    ? "…"
    : chain === "celo"
      ? formatCusd(value)
      : (Number(value) / 1_000_000).toFixed(4);
  const networkLabel = chain === "celo" ? "CELO" : "STACKS";
  const stats = [
    { label: "PILOTS", value: loading ? "…" : uau.toString() },
    { label: "ACTIONS", value: loading ? "…" : actions.toString() },
    { label: valueLabel, value: valueValue },
    { label: "NETWORK", value: networkLabel },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((s) => (
        <div key={s.label} className="rounded-lg px-4 sm:px-6 py-5 sm:py-6 surface-elevated">
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

function AddressCell({
  address,
  breakdown,
  chain,
}: {
  address: string;
  breakdown: Record<string, number>;
  chain: ChainTab;
}) {
  const top3 = Object.entries(breakdown).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const href =
    chain === "celo"
      ? `https://celoscan.io/address/${address}`
      : `https://explorer.hiro.so/address/${address}?chain=mainnet`;
  const label = chain === "celo" ? shortAddr(address) : shortStxAddress(address);
  return (
    <div className="min-w-0">
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="text-sm font-semibold font-mono block truncate transition-colors"
        style={{ color: "var(--color-ink-blue)" }}
      >
        {label}
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
