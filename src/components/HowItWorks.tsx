/**
 * How It Works — follows Column DESIGN.md prompt #2 (Product Feature Card):
 * Ghost White bg, 8px radius, subtle card shadow, 24px padding,
 * Title: Inter 20px/500/Ink Blue, Body: Inter 14px/400/Slate Text
 */
export function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Connect Wallet",
      desc: "Open Flap in MiniPay or connect any Celo-compatible wallet. No seed phrases needed.",
      icon: "M21 12V7H5a2 2 0 010-4h14v4M3 5v14a2 2 0 002 2h16v-5M18 12a1 1 0 100 2 1 1 0 000-2z",
    },
    {
      step: "02",
      title: "Tap to Play",
      desc: "Each game costs $0.05 cUSD — or use a free credit from daily check-ins. Tap to flap, dodge pipes.",
      icon: "M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z",
    },
    {
      step: "03",
      title: "Score On-Chain",
      desc: "Your score is attested by our backend signer and recorded on Celo. Every result is verifiable on Celoscan.",
      icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4",
    },
    {
      step: "04",
      title: "Win Prizes",
      desc: "Top 3 daily scores split the prize pool. Our AI agent distributes rewards automatically every 24 hours.",
      icon: "M6 9H4.5a2.5 2.5 0 010-5C7 4 7 8 7 8M18 9h1.5a2.5 2.5 0 000-5C17 4 17 8 17 8M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M12 2v7",
    },
  ];

  return (
    <section id="how-it-works" style={{ padding: '80px 0', background: 'var(--color-ghost-white)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        {/* Section header */}
        <div className="text-center" style={{ marginBottom: 48 }}>
          <span style={{
            fontFamily: 'var(--font-suisseintl)',
            fontSize: 12,
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-action-orange)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>How It Works</span>
          <h2 style={{
            fontFamily: 'var(--font-suisseintl)',
            fontSize: 'var(--text-heading)',
            fontWeight: 'var(--font-weight-semibold)',
            lineHeight: 'var(--leading-heading)',
            letterSpacing: 'var(--tracking-heading)',
            color: 'var(--color-ink-blue)',
            marginTop: 12,
            marginBottom: 12,
          }}>Four steps to earning</h2>
          <p style={{
            fontFamily: 'var(--font-suisseintl)',
            fontSize: 16,
            color: 'var(--color-slate-text)',
            maxWidth: 440,
            margin: '0 auto',
            lineHeight: 1.5,
          }}>No complex setup. Connect, play, and earn — all transactions settle on Celo in under 5 seconds.</p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4" style={{ gap: 20 }}>
          {steps.map((step) => (
            <div key={step.step} className="surface-card" style={{ padding: 24, transition: 'all 0.25s ease' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-caption)',
                  color: 'var(--color-slate-text)',
                }}>STEP {step.step}</span>
                <div className="flex items-center justify-center" style={{
                  width: 40,
                  height: 40,
                  borderRadius: 'var(--radius-cards)',
                  background: 'var(--color-fog-gray)',
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-action-orange)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={step.icon} />
                  </svg>
                </div>
              </div>
              <h3 style={{
                fontFamily: 'var(--font-suisseintl)',
                fontSize: 'var(--text-subheading)',
                fontWeight: 'var(--font-weight-medium)',
                lineHeight: 'var(--leading-subheading)',
                letterSpacing: 'var(--tracking-subheading)',
                color: 'var(--color-ink-blue)',
                marginBottom: 8,
              }}>{step.title}</h3>
              <p style={{
                fontFamily: 'var(--font-suisseintl)',
                fontSize: 'var(--text-body)',
                lineHeight: 'var(--leading-body)',
                letterSpacing: 'var(--tracking-body)',
                color: 'var(--color-slate-text)',
              }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
