"use client";

import Link from "next/link";
import { useState } from "react";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 24px 0' }}>
        <div className="flex items-center justify-between" style={{
          height: 56,
          padding: '0 20px',
          borderRadius: 'var(--radius-xl)',
          background: 'rgba(255,255,255,0.75)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--color-steel-gray)',
          boxShadow: 'var(--shadow-subtle-5)',
        }}>
          {/* Logo */}
          <Link href="/" className="flex items-center no-underline" style={{ gap: 10 }}>
            <div className="flex items-center justify-center" style={{
              width: 28, height: 28, borderRadius: 6,
              background: 'var(--color-action-orange)',
              boxShadow: '0 1px 3px rgba(236,101,43,0.3)',
            }}>
              <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>F</span>
            </div>
            <span style={{
              fontFamily: 'var(--font-suisseintl)', fontSize: 16,
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-ink-blue)',
              letterSpacing: '-0.02em',
            }}>Flap</span>
          </Link>

          {/* Desktop nav — Primary Navigation Links per DESIGN.md */}
          <nav className="hidden md:flex items-center" style={{ gap: 4 }}>
            {[
              { label: "How It Works", href: "#how-it-works" },
              { label: "Rewards", href: "#rewards" },
              { label: "Leaderboard", href: "#leaderboard" },
            ].map((link) => (
              <Link key={link.label} href={link.href} className="btn-ghost" style={{ fontSize: 14 }}>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right — Ghost + CTA */}
          <div className="hidden md:flex items-center" style={{ gap: 8 }}>
            <Link href="/profile" className="btn-ghost" style={{ fontSize: 14 }}>Profile</Link>
            <Link href="/play" className="btn-primary" style={{ padding: '8px 20px', fontSize: 14 }}>
              Play Now
            </Link>
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}
            style={{ padding: 8, background: 'none', border: 'none', cursor: 'pointer' }} aria-label="Menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink-blue)" strokeWidth="2">
              {menuOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M4 8h16M4 16h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden flex flex-col" style={{
            marginTop: 8, padding: 16, borderRadius: 'var(--radius-xl)',
            background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(16px)',
            border: '1px solid var(--color-steel-gray)', boxShadow: 'var(--shadow-xl)',
            gap: 4,
          }}>
            {["How It Works", "Rewards", "Leaderboard"].map((item) => (
              <Link key={item} href={`#${item.toLowerCase().replace(/ /g, "-")}`}
                className="btn-ghost" style={{ justifyContent: 'flex-start', padding: '12px 12px', fontSize: 15 }}
                onClick={() => setMenuOpen(false)}>{item}</Link>
            ))}
            <div style={{ height: 1, background: 'var(--color-steel-gray)', margin: '4px 0' }} />
            <Link href="/play" className="btn-primary" style={{ textAlign: 'center', marginTop: 4 }}
              onClick={() => setMenuOpen(false)}>Play Now</Link>
          </div>
        )}
      </div>
    </header>
  );
}
