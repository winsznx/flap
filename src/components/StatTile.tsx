import type { ReactNode } from "react";

type Props = { label: string; value: ReactNode; hint?: ReactNode; className?: string };

export function StatTile({ label, value, hint, className = "" }: Props) {
  return (
    <div
      className={`rounded-2xl border border-steel-gray bg-white px-5 py-6 ${className}`}
    >
      <div
        className="font-mono text-[10px] uppercase tracking-widest"
        style={{ color: "var(--color-slate-text)" }}
      >
        {label}
      </div>
      <div
        className="mt-2 text-2xl font-semibold leading-none tabular-nums md:text-3xl"
        style={{ color: "var(--color-ink-blue)" }}
      >
        {value}
      </div>
      {hint && (
        <div
          className="mt-2 font-mono text-xs"
          style={{ color: "var(--color-slate-text)" }}
        >
          {hint}
        </div>
      )}
    </div>
  );
}
