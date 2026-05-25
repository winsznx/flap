"use client";

import { useNowSec } from "@/lib/useNowSec";

/**
 * Live countdown to the next 00:00 UTC daily-bounty roll. Inline because the
 * landing strip wants it without a layout container.
 */
export function BountyClock({ className = "" }: { className?: string }) {
  const nowSec = useNowSec();
  if (nowSec === 0) {
    return (
      <span className={`font-mono text-[11px] uppercase tracking-widest ${className}`} style={{ color: "var(--color-slate-text)" }}>
        bounty rolls daily 00:00 UTC
      </span>
    );
  }
  const sinceMidnight = nowSec % 86400;
  const left = 86400 - sinceMidnight;
  const h = Math.floor(left / 3600);
  const m = Math.floor((left % 3600) / 60);
  const s = left % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    <span
      className={`inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-widest ${className}`}
      style={{ color: "var(--color-slate-text)" }}
    >
      <span style={{ color: "var(--color-action-orange)" }}>●</span>
      bounty rolls in {pad(h)}:{pad(m)}:{pad(s)}
    </span>
  );
}
