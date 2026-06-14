import Link from "next/link";

/**
 * Landing-page leaderboard teaser.
 *
 * Previously rendered a hardcoded fake top-5 with placeholder 0xdead…beef
 * addresses and an href="#" Celoscan link. That looked like a pre-launch
 * mock; we now show a single CTA that links to the real on-chain
 * /leaderboard route. The actual ranked list there reads live aggregates
 * from both Celo and Stacks via OnchainLeaderboard.
 */
export function Leaderboard() {
  return (
    <section id="leaderboard" style={{ padding: '80px 0', background: 'var(--color-ghost-white)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div className="text-center" style={{ marginBottom: 32 }}>
          <span style={{
            fontFamily: 'var(--font-suisseintl)', fontSize: 12, fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-action-orange)', letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>Leaderboard</span>
          <h2 style={{
            fontFamily: 'var(--font-suisseintl)', fontSize: 'var(--text-heading)', fontWeight: 'var(--font-weight-medium)',
            lineHeight: 'var(--leading-heading)', letterSpacing: 'var(--tracking-heading)',
            color: 'var(--color-ink-blue)', marginTop: 12, marginBottom: 12,
          }}>Top pilots — ranked on-chain</h2>
          <p style={{ fontFamily: 'var(--font-suisseintl)', fontSize: 16, color: 'var(--color-slate-text)', maxWidth: 480, margin: '0 auto', lineHeight: 1.5 }}>
            Daily bounty splits across the top 3 scores. Live ranks pulled from Celo + Stacks events.
          </p>
        </div>
        <div className="text-center">
          <Link href="/leaderboard" className="btn-primary">
            See live rankings ↗
          </Link>
        </div>
      </div>
    </section>
  );
}
