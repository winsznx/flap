/**
 * Leaderboard — Column Design System
 * Uses table-header / table-row with monospace for addresses and figures
 */
export function Leaderboard() {
  const players = [
    { rank: 1, address: "0x1234...5678", score: 142, earnings: "$12.40", games: 38 },
    { rank: 2, address: "0xabcd...ef01", score: 128, earnings: "$8.20", games: 45 },
    { rank: 3, address: "0x9876...5432", score: 119, earnings: "$6.10", games: 22 },
    { rank: 4, address: "0xdead...beef", score: 97, earnings: "$3.50", games: 61 },
    { rank: 5, address: "0xcafe...babe", score: 91, earnings: "$2.80", games: 17 },
  ];

  const medalColors = ["#FFD700", "#C0C0C0", "#CD7F32"];

  return (
    <section id="leaderboard" style={{ padding: '80px 0', background: 'var(--color-ghost-white)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        {/* Header */}
        <div className="text-center" style={{ marginBottom: 48 }}>
          <span style={{
            fontFamily: 'var(--font-suisseintl)', fontSize: 12, fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-action-orange)', letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>Leaderboard</span>
          <h2 style={{
            fontFamily: 'var(--font-suisseintl)', fontSize: 'var(--text-heading)', fontWeight: 'var(--font-weight-medium)',
            lineHeight: 'var(--leading-heading)', letterSpacing: 'var(--tracking-heading)',
            color: 'var(--color-ink-blue)', marginTop: 12, marginBottom: 12,
          }}>Today&apos;s top pilots</h2>
          <p style={{ fontFamily: 'var(--font-suisseintl)', fontSize: 16, color: 'var(--color-slate-text)', maxWidth: 400, margin: '0 auto', lineHeight: 1.5 }}>
            Top 3 scores split the daily prize pool. Rankings reset every 24 hours.
          </p>
        </div>

        {/* Table */}
        <div className="surface-elevated overflow-hidden" style={{ maxWidth: 760, margin: '0 auto' }}>
          {/* Header row */}
          <div className="table-header" style={{ gridTemplateColumns: '56px 1fr 90px 90px 70px' }}>
            <span>Rank</span>
            <span>Player</span>
            <span style={{ textAlign: 'right' }}>Score</span>
            <span style={{ textAlign: 'right' }}>Earned</span>
            <span style={{ textAlign: 'right' }}>Games</span>
          </div>

          {/* Data rows */}
          {players.map((p) => (
            <div key={p.rank} className="table-row" style={{ gridTemplateColumns: '56px 1fr 90px 90px 70px' }}>
              <div>
                {p.rank <= 3 ? (
                  <div className="flex items-center justify-center" style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: medalColors[p.rank - 1], color: 'white',
                    fontSize: 12, fontWeight: 'var(--font-weight-semibold)',
                  }}>{p.rank}</div>
                ) : (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--color-slate-text)', paddingLeft: 8 }}>{p.rank}</span>
                )}
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--color-charcoal-text)' }}>
                {p.address}
              </span>
              <span style={{ fontFamily: 'var(--font-suisseintl)', fontSize: 14, fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-blue)', textAlign: 'right' }}>
                {p.score}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--color-success-moss)', textAlign: 'right' }}>
                {p.earnings}
              </span>
              <span style={{ fontFamily: 'var(--font-suisseintl)', fontSize: 14, color: 'var(--color-slate-text)', textAlign: 'right' }}>
                {p.games}
              </span>
            </div>
          ))}

          {/* Footer */}
          <div style={{ padding: '12px 20px', background: 'var(--color-fog-gray)', textAlign: 'center', borderTop: '1px solid var(--color-steel-gray)' }}>
            <span style={{ fontFamily: 'var(--font-suisseintl)', fontSize: 12, color: 'var(--color-slate-text)' }}>
              Updated every block · Verified on{" "}
              <a href="#" style={{ color: 'var(--color-deep-plum)', textDecoration: 'underline' }}>Celoscan</a>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
