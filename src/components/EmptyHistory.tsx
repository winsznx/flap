import Link from "next/link";

export function EmptyHistory() {
  return (
    <div className="rounded-2xl border border-steel-gray bg-white p-8 text-center">
      <div
        className="font-mono text-[10px] uppercase tracking-widest"
        style={{ color: "var(--color-slate-text)" }}
      >
        no plays yet
      </div>
      <h3 className="mt-2 text-lg font-semibold" style={{ color: "var(--color-ink-blue)" }}>
        First flight
      </h3>
      <p className="mt-2 text-sm" style={{ color: "var(--color-slate-text)" }}>
        Stake any amount on /play. Your settled scores show up here.
      </p>
      <Link href="/play" className="btn-primary mt-4 inline-flex px-5 py-2 text-sm">
        Play now →
      </Link>
    </div>
  );
}
