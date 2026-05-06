"use client";

import Link from "next/link";

/**
 * Hero — Column Design System
 * Per DESIGN.md prompt #1: Ghost White bg, subtle Faded Grid Blue overlay,
 * SuisseIntl 48px/600 headline, Inter 18px subtext in Slate Text,
 * CTA Button Filled + Secondary Button Outlined
 */
export function HeroSection() {
  return (
    <section className="relative pt-28 pb-24 overflow-hidden" style={{ background: 'var(--color-ghost-white)' }}>
      {/* Blueprint grid overlay — per DESIGN.md imagery section */}
      <div className="absolute inset-0 grid-pattern" />
      <div className="absolute inset-0 hero-glow" />

      <div className="relative" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div className="flex flex-col lg:flex-row items-center" style={{ gap: 64 }}>

          {/* Left — Copy */}
          <div className="flex-1 text-center lg:text-left stagger">
            {/* Live badge */}
            <div>
              <span className="badge badge-success">
                <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: 'var(--color-success-moss)' }} />
                Live on Celo
              </span>
            </div>

            {/* Headline — SuisseIntl 48px weight 600, Ink Blue, lineHeight 1.1, letterSpacing -1.44px */}
            <div>
              <h1 style={{
                fontFamily: 'var(--font-suisseintl)',
                fontSize: 'var(--text-display)',
                fontWeight: 'var(--font-weight-semibold)',
                lineHeight: 'var(--leading-display)',
                letterSpacing: 'var(--tracking-display)',
                color: 'var(--color-ink-blue)',
                marginTop: 24,
                marginBottom: 20,
              }}>
                Tap to fly.
                <br />
                <span className="gradient-text">Earn cUSD.</span>
              </h1>
            </div>

            {/* Subtext — Inter 18px weight 400, Slate Text */}
            <div>
              <p style={{
                fontFamily: 'var(--font-suisseintl)',
                fontSize: 'var(--text-subheading)',
                fontWeight: 'var(--font-weight-regular)',
                lineHeight: 'var(--leading-subheading)',
                letterSpacing: 'var(--tracking-subheading)',
                color: 'var(--color-slate-text)',
                maxWidth: 460,
                margin: '0 auto',
                marginBottom: 32,
              }}>
                A flappy bird game where every run settles on-chain. Dodge pipes, 
                collect coins, and win daily stablecoin prizes — all inside MiniPay.
              </p>
            </div>

            {/* CTAs — CTA Filled + Secondary Outlined, 24px horizontal spacing */}
            <div>
              <div className="flex flex-col sm:flex-row items-center" style={{ gap: 16 }}>
                <Link href="/play" className="btn-primary" style={{ padding: '14px 32px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                  Play Now — $0.05
                </Link>
                <Link href="#how-it-works" className="btn-secondary" style={{ padding: '14px 32px' }}>
                  How It Works
                </Link>
              </div>
            </div>

            {/* Trust indicators — Inter 12px, Slate Text */}
            <div>
              <div className="flex items-center justify-center lg:justify-start" style={{ gap: 20, marginTop: 28 }}>
                {[
                  { path: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", text: "Verified Contract" },
                  { path: "M9 12l2 2 4-4M22 12A10 10 0 112 12a10 10 0 0120 0z", text: "MiniPay Native" },
                  { path: "M13 2L3 14h9l-1 8 10-12h-9l1-8z", text: "Instant Settlement" },
                ].map((item) => (
                  <span key={item.text} className="flex items-center" style={{
                    gap: 6,
                    fontFamily: 'var(--font-suisseintl)',
                    fontSize: 12,
                    color: 'var(--color-slate-text)',
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d={item.path} /></svg>
                    {item.text}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Game Preview Card */}
          <div className="flex-shrink-0 animate-float">
            <div className="relative overflow-hidden" style={{
              width: 280,
              height: 460,
              borderRadius: 'var(--radius-cards)',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid var(--color-steel-gray)',
            }}>
              {/* Sky */}
              <div className="w-full h-full relative" style={{ background: 'linear-gradient(180deg, #4FC3F7 0%, #81D4FA 40%, #B3E5FC 70%, #C8E6C9 100%)' }}>
                {/* Clouds */}
                <div className="absolute" style={{ top: '8%', left: '12%', width: 56, height: 18, background: 'rgba(255,255,255,0.5)', borderRadius: 9999 }} />
                <div className="absolute" style={{ top: '16%', right: '12%', width: 64, height: 14, background: 'rgba(255,255,255,0.35)', borderRadius: 9999 }} />

                {/* Pipes */}
                <div className="absolute" style={{ top: 0, left: '22%', width: 48, height: '30%', background: 'linear-gradient(90deg, #2E7D32, #388E3C, #2E7D32)', borderRadius: '0 0 3px 3px' }}>
                  <div className="absolute" style={{ bottom: 0, left: -3, right: -3, height: 18, background: '#1B5E20', borderRadius: 2 }} />
                </div>
                <div className="absolute" style={{ bottom: '10%', left: '22%', width: 48, height: '30%', background: 'linear-gradient(90deg, #2E7D32, #388E3C, #2E7D32)', borderRadius: '3px 3px 0 0' }}>
                  <div className="absolute" style={{ top: 0, left: -3, right: -3, height: 18, background: '#1B5E20', borderRadius: 2 }} />
                </div>

                {/* Bird */}
                <div className="absolute" style={{ top: '40%', left: '40%' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'radial-gradient(circle at 40% 35%, #FFE082, #FFC107)', boxShadow: '0 3px 12px rgba(255,193,7,0.4)' }}>
                    <div className="absolute" style={{ top: 6, right: 6, width: 11, height: 11, background: 'white', borderRadius: '50%' }}>
                      <div className="absolute" style={{ top: 2, right: 2, width: 6, height: 6, background: 'var(--color-ink-blue)', borderRadius: '50%' }} />
                    </div>
                    <div className="absolute" style={{ top: 10, right: -8, width: 0, height: 0, borderTop: '4px solid transparent', borderBottom: '4px solid transparent', borderLeft: '8px solid var(--color-action-orange)' }} />
                  </div>
                </div>

                {/* Coin */}
                <div className="absolute flex items-center justify-center" style={{ top: '54%', right: '28%', width: 22, height: 22, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #FFE082, #FFC107)', boxShadow: '0 0 12px rgba(255,193,7,0.4)', border: '1.5px solid #F9A825' }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#8B6914' }}>$</span>
                </div>

                {/* Score */}
                <div className="absolute" style={{ top: 20, left: '50%', transform: 'translateX(-50%)', fontSize: 28, fontWeight: 700, color: 'white', textShadow: '0 2px 8px rgba(0,0,0,0.2)', fontFamily: 'var(--font-suisseintl)' }}>24</div>

                {/* Ground */}
                <div className="absolute" style={{ bottom: 0, left: 0, right: 0, height: '10%' }}>
                  <div style={{ height: 4, background: 'var(--color-success-moss)' }} />
                  <div style={{ height: '100%', background: '#795548' }} />
                </div>

                {/* CTA pill */}
                <div className="absolute flex justify-center" style={{ bottom: 20, left: 0, right: 0 }}>
                  <span style={{ padding: '8px 18px', borderRadius: 9999, fontSize: 11, fontWeight: 500, color: 'white', background: 'rgba(1,24,33,0.7)', backdropFilter: 'blur(8px)' }}>
                    Tap anywhere to play →
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
