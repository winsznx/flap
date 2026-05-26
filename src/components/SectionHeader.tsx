import type { ReactNode } from "react";

type Props = { eyebrow?: string; title: string; description?: ReactNode; trailing?: ReactNode; className?: string };

export function SectionHeader({ eyebrow, title, description, trailing, className = "" }: Props) {
  return (
    <header className={`mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between ${className}`}>
      <div className="min-w-0">
        {eyebrow && (
          <div
            className="font-mono text-[11px] uppercase tracking-[0.15em]"
            style={{ color: "var(--color-action-orange)" }}
          >
            {eyebrow}
          </div>
        )}
        <h2 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--color-ink-blue)" }}>
          {title}
        </h2>
        {description && (
          <p className="mt-1 max-w-prose text-sm" style={{ color: "var(--color-slate-text)" }}>
            {description}
          </p>
        )}
      </div>
      {trailing && <div className="shrink-0">{trailing}</div>}
    </header>
  );
}
