export default function Loading() {
  return (
    <main className="app-shell flex min-h-[100svh] items-center justify-center px-5 py-20">
      <div className="flex flex-col items-center gap-4 text-center">
        <span
          className="h-2 w-24 animate-pulse rounded-full"
          style={{ background: "var(--color-action-orange)" }}
        />
        <span
          className="font-mono text-[11px] uppercase tracking-[0.15em]"
          style={{ color: "var(--color-slate-text)" }}
        >
          loading
        </span>
      </div>
    </main>
  );
}
