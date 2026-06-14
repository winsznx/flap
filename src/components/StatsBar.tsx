"use client";

import { useMemo } from "react";
import { formatUnits } from "viem";
import { useReadContract } from "wagmi";
import { useChainKind } from "@/chain/ChainProvider";
import { flapAbi } from "@/lib/abi/flap";
import { FLAP_ADDRESS, isFlapDeployed } from "@/lib/wagmi";

/**
 * Live stats strip below the hero. Reads today's bounty pool, total plays
 * settled today, and the pool size from the on-chain Flap contract instead
 * of shipping a row of hardcoded zeros.
 */
export function StatsBar() {
  const { kind } = useChainKind();
  const onCelo = kind === "celo";

  const { data: today } = useReadContract({
    abi: flapAbi,
    address: FLAP_ADDRESS,
    functionName: "today",
    query: { enabled: onCelo && isFlapDeployed, refetchInterval: 60_000 },
  });

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

  const { data: streakRaw } = useReadContract({
    abi: flapAbi,
    address: FLAP_ADDRESS,
    functionName: "playStreak",
    args: undefined,
    query: { enabled: false },
  });
  void streakRaw;

  const stats = useMemo(() => {
    const bounty = ledger?.bountyPool ? Number(formatUnits(ledger.bountyPool, 18)) : 0;
    const finalized = ledger?.finalized ? 1 : 0;
    const top = ledger?.topScore ? Number(ledger.topScore) : 0;
    return [
      {
        label: "Today's bounty",
        value: onCelo ? `$${bounty.toFixed(2)}` : "Celo only",
      },
      {
        label: "Top score today",
        value: onCelo ? top.toLocaleString() : "—",
      },
      {
        label: "Days settled",
        value: onCelo ? finalized.toString() : "—",
      },
      {
        label: "Network",
        value: onCelo ? "Celo · Stacks" : "Stacks",
      },
    ];
  }, [ledger, onCelo]);

  return (
    <section style={{ background: 'var(--color-fog-gray)', borderTop: '1px solid var(--color-steel-gray)', borderBottom: '1px solid var(--color-steel-gray)', padding: '28px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 24 }}>
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div style={{
                fontFamily: 'var(--font-suisseintl)',
                fontSize: 'var(--text-heading-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                lineHeight: 'var(--leading-heading-sm)',
                letterSpacing: 'var(--tracking-heading-sm)',
                color: 'var(--color-ink-blue)',
              }}>
                {stat.value}
              </div>
              <div style={{
                fontFamily: 'var(--font-suisseintl)',
                fontSize: 'var(--text-caption)',
                color: 'var(--color-slate-text)',
                marginTop: 4,
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
