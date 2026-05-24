"use client";

import type { ReactNode } from "react";

type Props = {
  title?: string;
  description?: ReactNode;
  hint?: ReactNode;
  onRetry?: () => void;
  className?: string;
};

export function ErrorState({
  title = "Something went off-course",
  description,
  hint,
  onRetry,
  className = "",
}: Props) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center gap-3 rounded-2xl border border-steel-gray bg-white px-6 py-12 text-center ${className}`}
    >
      <span aria-hidden className="text-2xl" style={{ color: "var(--color-action-orange)" }}>
        ⚠︎
      </span>
      <h3 className="text-lg font-semibold" style={{ color: "var(--color-ink-blue)" }}>
        {title}
      </h3>
      {description && (
        <p className="max-w-md text-sm" style={{ color: "var(--color-slate-text)" }}>
          {description}
        </p>
      )}
      {hint && (
        <p className="font-mono text-xs" style={{ color: "var(--color-slate-text)" }}>
          {hint}
        </p>
      )}
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-secondary mt-1 px-4 py-1.5 text-xs">
          Try again
        </button>
      )}
    </div>
  );
}
