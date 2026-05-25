"use client";

import Link from "next/link";

export default function PlayError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="app-shell flex min-h-screen items-center justify-center px-5 py-20">
      <div className="surface-elevated max-w-md rounded-2xl p-8 text-center">
        <div
          className="font-mono text-[11px] uppercase tracking-[0.15em]"
          style={{ color: "var(--color-action-orange)" }}
        >
          flight aborted
        </div>
        <h1 className="mt-3 text-2xl font-semibold" style={{ color: "var(--color-ink-blue)" }}>
          Couldn&apos;t boot the canvas
        </h1>
        <p className="mt-3 text-sm" style={{ color: "var(--color-slate-text)" }}>
          The game engine or stake-read errored mid-mount. Reload and reconnect your wallet.
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
    </main>
  );
}
