"use client";

import { QrCode } from "./QrCode";

type Props = {
  title: string;
  score?: number;
  url: string;
  className?: string;
};

/**
 * Sharable score card. Vertical, fits a portrait phone screenshot, leaves
 * the action-orange accent for the score so it stays the visual centerpiece.
 */
export function ShareCard({ title, score, url, className = "" }: Props) {
  return (
    <div
      className={`flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border border-steel-gray bg-white p-6 shadow-sm ${className}`}
      style={{ color: "var(--color-ink-blue)" }}
    >
      <span className="text-[11px] uppercase tracking-[0.2em] font-mono" style={{ color: "var(--color-action-orange)" }}>
        Flap · daily bounty
      </span>
      <h3 className="text-center text-xl font-semibold">{title}</h3>
      {typeof score === "number" && (
        <div className="text-center">
          <div className="font-mono text-[11px] uppercase tracking-widest" style={{ color: "var(--color-slate-text)" }}>
            Score
          </div>
          <div className="text-4xl font-semibold tabular-nums" style={{ color: "var(--color-action-orange)" }}>
            {score}
          </div>
        </div>
      )}
      <div className="rounded-xl border border-steel-gray bg-white p-3">
        <QrCode value={url} size={184} />
      </div>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="truncate text-center font-mono text-xs hover:underline"
        style={{ color: "var(--color-slate-text)" }}
      >
        {url}
      </a>
    </div>
  );
}
