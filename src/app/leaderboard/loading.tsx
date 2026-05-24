export default function LeaderboardLoading() {
  return (
    <main className="app-shell">
      <div className="container-page py-20">
        <div
          className="font-mono text-[11px] uppercase tracking-[0.15em]"
          style={{ color: "var(--color-action-orange)" }}
        >
          indexing
        </div>
        <div
          className="mt-3 h-10 w-2/3 animate-pulse rounded-lg"
          style={{ background: "var(--color-fog-gray)" }}
        />
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-lg"
              style={{ background: "var(--color-fog-gray)" }}
            />
          ))}
        </div>
        <div className="mt-8 space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded-lg"
              style={{ background: "var(--color-fog-gray)" }}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
