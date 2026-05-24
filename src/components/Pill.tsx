import type { ReactNode } from "react";

type Tone = "neutral" | "win" | "lose" | "info" | "warn";

const TONES: Record<Tone, { bg: string; fg: string }> = {
  neutral: { bg: "var(--color-fog-gray)", fg: "var(--color-slate-text)" },
  win: { bg: "rgba(68,180,139,0.12)", fg: "var(--color-success-moss)" },
  lose: { bg: "rgba(236,101,43,0.12)", fg: "var(--color-action-orange)" },
  info: { bg: "rgba(126,167,233,0.18)", fg: "var(--color-info-blue)" },
  warn: { bg: "rgba(255,184,0,0.12)", fg: "var(--color-amber)" },
};

export function Pill({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  const t = TONES[tone];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest ${className}`}
      style={{ background: t.bg, color: t.fg }}
    >
      {children}
    </span>
  );
}
