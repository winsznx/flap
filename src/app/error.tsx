"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[flap] route error:", error);
  }, [error]);

  return (
    <main className="app-shell flex min-h-[100svh] items-center justify-center px-5 py-20">
      <div className="surface-elevated max-w-md rounded-2xl p-8 text-center">
        <div
          className="font-mono text-[11px] uppercase tracking-[0.15em]"
          style={{ color: "var(--color-action-orange)" }}
        >
          something cracked
        </div>
        <h1
          className="mt-3 text-2xl font-semibold"
          style={{ color: "var(--color-ink-blue)" }}
        >
          Flap had a wobble
        </h1>
        <p className="mt-3 text-sm" style={{ color: "var(--color-slate-text)" }}>
          A route handler crashed mid-render. Your score history is safe — it lives in localStorage and on chain.
        </p>
        {error.digest && (
          <p className="mt-3 font-mono text-[11px]" style={{ color: "var(--color-slate-text)" }}>
            trace: {error.digest}
          </p>
        )}
        <div className="mt-6 flex justify-center gap-3">
          <button type="button" onClick={reset} className="btn-primary px-5 py-2 text-sm">
            Reset
          </button>
          <Link href="/" className="btn-secondary px-5 py-2 text-sm">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
