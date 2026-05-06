/**
 * Daily Rewards — Column Design System
 * Left: heading + body + checklist
 * Right: Card with streak calendar + CTA
 * Section bg: Fog Gray (per DESIGN.md "alternate between Ghost White and Fog Gray")
 */
export function DailyRewards() {
  const days = [
    { day: 1, label: "1", reward: "1 Free Play", done: true },
    { day: 2, label: "2", reward: "1 Free Play", done: false },
    { day: 3, label: "3", reward: "1 Free Play", done: false },
    { day: 4, label: "4", reward: "1 Free Play", done: false },
    { day: 5, label: "5", reward: "1 Free Play", done: false },
    { day: 6, label: "6", reward: "1 Free Play", done: false },
    { day: 7, label: "7", reward: "3 Free Plays", done: false, bonus: true },
  ];

  return (
    <section id="rewards" style={{ padding: '80px 0', background: 'var(--color-fog-gray)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div className="flex flex-col lg:flex-row items-start" style={{ gap: 64 }}>
          {/* Left — Text */}
          <div className="flex-1">
            <span style={{
              fontFamily: 'var(--font-suisseintl)', fontSize: 12, fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-action-orange)', letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>Daily Rewards</span>

            <h2 style={{
              fontFamily: 'var(--font-suisseintl)', fontSize: 'var(--text-heading)', fontWeight: 'var(--font-weight-medium)',
              lineHeight: 'var(--leading-heading)', letterSpacing: 'var(--tracking-heading)',
              color: 'var(--color-ink-blue)', marginTop: 12, marginBottom: 16,
            }}>
              Check in daily,<br />play for free
            </h2>

            <p style={{
              fontFamily: 'var(--font-suisseintl)', fontSize: 16, lineHeight: 1.5,
              color: 'var(--color-slate-text)', maxWidth: 400, marginBottom: 24,
            }}>
              Every day you check in, you earn free game credits on-chain. Build a streak for bonus plays. 
              Miss a day and your streak resets.
            </p>

            {/* Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                "1 on-chain transaction per check-in",
                "Free credits stored in smart contract",
                "7-day streak → 3× bonus credits",
                "Refer friends → earn extra credits",
              ].map((item) => (
                <div key={item} className="flex items-center" style={{ gap: 10 }}>
                  <div className="flex items-center justify-center" style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(68,180,139,0.08)' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-success-moss)" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                  </div>
                  <span style={{ fontFamily: 'var(--font-suisseintl)', fontSize: 14, color: 'var(--color-charcoal-text)' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Streak Card */}
          <div className="w-full lg:w-auto flex-shrink-0">
            <div className="surface-elevated" style={{ padding: 28, maxWidth: 380, margin: '0 auto' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-suisseintl)', fontSize: 16, fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-blue)' }}>
                  This Week
                </h3>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-slate-text)' }}>
                  🔥 0 day streak
                </span>
              </div>

              <div className="grid grid-cols-7" style={{ gap: 8 }}>
                {days.map((d) => (
                  <div key={d.day} className="flex flex-col items-center" style={{ gap: 6 }}>
                    <div className="flex items-center justify-center" style={{
                      width: 40,
                      height: 40,
                      borderRadius: 'var(--radius-cards)',
                      fontSize: 14,
                      fontWeight: 'var(--font-weight-medium)',
                      transition: 'all 0.2s ease',
                      ...(d.done
                        ? { background: 'var(--color-action-orange)', color: 'white', boxShadow: '0 2px 8px rgba(236,101,43,0.25)' }
                        : d.bonus
                        ? { background: 'rgba(17,26,74,0.06)', color: 'var(--color-deep-plum)', border: '1px solid rgba(17,26,74,0.12)' }
                        : { background: 'var(--color-ghost-white)', color: 'var(--color-slate-text)', border: '1px solid var(--color-steel-gray)' }
                      ),
                    }}>
                      {d.done ? "✓" : d.bonus ? "★" : "·"}
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-slate-text)' }}>{d.label}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--color-steel-gray)' }}>
                <button className="btn-primary" style={{ width: '100%', padding: '12px 0', fontSize: 14 }} disabled>
                  Connect Wallet to Check In
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
