import type { ReactNode } from "react";

type Tone = "info" | "warning" | "success";

const TONES: Record<Tone, { border: string; bg: string; fg: string; glyph: string }> = {
  info: {
    border: "var(--color-info-blue)",
    bg: "rgba(126,167,233,0.10)",
    fg: "var(--color-info-blue)",
    glyph: "ⓘ",
  },
  warning: {
    border: "var(--color-action-orange)",
    bg: "rgba(236,101,43,0.10)",
    fg: "var(--color-action-orange)",
    glyph: "⚠",
  },
  success: {
    border: "var(--color-success-moss)",
    bg: "rgba(68,180,139,0.10)",
    fg: "var(--color-success-moss)",
    glyph: "✓",
  },
};

type Props = { tone?: Tone; title?: string; children: ReactNode; className?: string };

export function InfoCallout({ tone = "info", title, children, className = "" }: Props) {
  const t = TONES[tone];
  return (
    <div
      className={`flex gap-3 rounded-xl border px-4 py-3 ${className}`}
      style={{ borderColor: t.border, background: t.bg, color: t.fg }}
    >
      <span aria-hidden className="text-base leading-none">
        {t.glyph}
      </span>
      <div className="text-sm">
        {title && <div className="font-semibold">{title}</div>}
        <div className={title ? "mt-0.5 opacity-90" : ""}>{children}</div>
      </div>
    </div>
  );
}
