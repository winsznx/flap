import Link from "next/link";

/**
 * Footer — Dark section with Column tokens
 * Per DESIGN.md: Ink Blue bg for dark contexts
 */
export function Footer() {
  return (
    <footer style={{ background: 'var(--color-ink-blue)', color: 'white', padding: '64px 0 32px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div className="grid grid-cols-1 md:grid-cols-4" style={{ gap: 48, marginBottom: 48 }}>
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center" style={{ gap: 10, marginBottom: 16 }}>
              <div className="flex items-center justify-center" style={{
                width: 28, height: 28, borderRadius: 6,
                background: 'var(--color-action-orange)',
              }}>
                <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>F</span>
              </div>
              <span style={{ fontFamily: 'var(--font-suisseintl)', fontSize: 16, fontWeight: 'var(--font-weight-semibold)' }}>Flap</span>
            </div>
            <p style={{ fontFamily: 'var(--font-suisseintl)', fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, maxWidth: 300 }}>
              A flappy bird game on Celo where every run counts. Built for MiniPay, powered by cUSD.
            </p>
          </div>

          {/* Game links */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-suisseintl)', fontSize: 11, fontWeight: 'var(--font-weight-medium)', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>Game</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: "Play Now", href: "/play" },
                { label: "Leaderboard", href: "#leaderboard" },
                { label: "Daily Rewards", href: "#rewards" },
                { label: "How It Works", href: "#how-it-works" },
              ].map((link) => (
                <Link key={link.label} href={link.href} style={{
                  fontFamily: 'var(--font-suisseintl)', fontSize: 14, color: 'rgba(255,255,255,0.6)',
                  textDecoration: 'none', transition: 'color 0.15s ease',
                }}>{link.label}</Link>
              ))}
            </div>
          </div>

          {/* Verify links */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-suisseintl)', fontSize: 11, fontWeight: 'var(--font-weight-medium)', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>Verify</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {["Contract on Celoscan", "Source on GitHub", "Sourcify Verification"].map((label) => (
                <a key={label} href="#" style={{
                  fontFamily: 'var(--font-suisseintl)', fontSize: 14, color: 'rgba(255,255,255,0.6)',
                  textDecoration: 'none',
                }}>{label}</a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between" style={{ paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.08)', gap: 12 }}>
          <span style={{ fontFamily: 'var(--font-suisseintl)', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
            © 2026 Flap. Built on Celo. Open source.
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
            Celo Mainnet · Chain ID 42220
          </span>
        </div>
      </div>
    </footer>
  );
}
