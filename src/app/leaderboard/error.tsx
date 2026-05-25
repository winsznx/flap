"use client";

import Link from "next/link";

export default function LeaderboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="app-shell">
      <div className="container-page py-20">
        <div className="surface-elevated max-w-lg rounded-2xl p-8 text-center">
          <div
            className="font-mono text-[11px] uppercase tracking-[0.15em]"
            style={{ color: "var(--color-action-orange)" }}
          >
            index failure
          </div>
          <h1 className="mt-3 text-2xl font-semibold" style={{ color: "var(--color-ink-blue)" }}>
            Couldn&apos;t aggregate the logs
          </h1>
          <p className="mt-3 text-sm" style={{ color: "var(--color-slate-text)" }}>
            Forno may be rate-limiting. Refresh in a minute.
          </p>
          {error.digest && (
            <p className="mt-3 font-mono text-[11px]" style={{ color: "var(--color-slate-text)" }}>
              trace: {error.digest}
            </p>
          )}
          <div className="mt-6 flex justify-center gap-3">
            <button type="button" onClick={reset} className="btn-primary px-5 py-2 text-sm">
              Retry
            </button>
            <Link href="/" className="btn-secondary px-5 py-2 text-sm">
              Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
