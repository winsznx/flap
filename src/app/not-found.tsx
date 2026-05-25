import Link from "next/link";

export default function NotFound() {
  return (
    <main className="app-shell flex min-h-screen items-center justify-center px-5 py-20">
      <div className="text-center">
        <div
          className="font-mono text-[11px] uppercase tracking-[0.15em]"
          style={{ color: "var(--color-action-orange)" }}
        >
          404
        </div>
        <h1
          className="mt-3 text-3xl font-semibold"
          style={{ color: "var(--color-ink-blue)" }}
        >
          You flew off the map
        </h1>
        <p
          className="mt-3 max-w-md text-sm"
          style={{ color: "var(--color-slate-text)" }}
        >
          That URL doesn&apos;t match a Flap route. Head back to home or jump into a game.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/" className="btn-primary px-5 py-2 text-sm">Home</Link>
          <Link href="/play" className="btn-secondary px-5 py-2 text-sm">Play</Link>
        </div>
      </div>
    </main>
  );
}
