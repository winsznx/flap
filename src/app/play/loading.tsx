export default function PlayLoading() {
  return (
    <main className="app-shell">
      <div className="container-page py-20">
        <div className="grid place-items-center gap-4">
          <div
            className="font-mono text-[11px] uppercase tracking-[0.15em]"
            style={{ color: "var(--color-action-orange)" }}
          >
            booting flight deck
          </div>
          <div
            className="aspect-[5/4] w-full max-w-[520px] animate-pulse rounded-2xl"
            style={{ background: "var(--color-fog-gray)" }}
          />
          <div className="grid w-full max-w-[520px] grid-cols-2 gap-3">
            <div className="h-20 animate-pulse rounded-lg" style={{ background: "var(--color-fog-gray)" }} />
            <div className="h-20 animate-pulse rounded-lg" style={{ background: "var(--color-fog-gray)" }} />
          </div>
        </div>
      </div>
    </main>
  );
}
