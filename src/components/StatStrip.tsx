import type { ReactNode } from "react";
import { StatTile } from "./StatTile";

type Stat = { label: string; value: ReactNode; hint?: ReactNode };

export function StatStrip({ stats, className = "" }: { stats: Stat[]; className?: string }) {
  return (
    <div className={`grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 ${className}`}>
      {stats.map((s) => (
        <StatTile key={s.label} label={s.label} value={s.value} hint={s.hint} />
      ))}
    </div>
  );
}
