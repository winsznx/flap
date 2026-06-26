"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { NetworkSelector } from "./NetworkSelector";
import { ConnectButton } from "./ConnectButton";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Escape-to-close on the mobile menu so keyboard users can dismiss without
  // hunting for the X button.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header className="fixed inset-x-0 top-3 z-50 px-3">
      <div className="mx-auto max-w-[1200px]">
        <div className="nav-frame flex min-h-[60px] lg:min-h-[72px] items-center justify-between gap-2 px-3 lg:gap-5 lg:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-3 no-underline" aria-label="Flap home">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-action-orange)] shadow-[0_1px_3px_rgba(236,101,43,0.3)]">
              <span className="text-[13px] font-bold text-white">F</span>
            </div>
            <span className="flex min-w-0 flex-col leading-none">
              <span className="text-[16px] font-semibold tracking-[-0.02em] text-[var(--color-ink-blue)]">
                Flap
              </span>
              <span className="mt-1 hidden max-w-[180px] truncate text-[12px] text-[var(--color-slate-text)] sm:block">
                Tap-to-earn on Celo
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full bg-[var(--color-fog-gray)] p-1 lg:flex">
            {[
              { label: "How It Works", href: "/#how-it-works" },
              { label: "Rewards", href: "/#rewards" },
              { label: "Leaderboard", href: "/leaderboard" },
            ].map((link) => (
              <Link key={link.label} href={link.href} className="nav-link">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden shrink-0 items-center gap-2 lg:flex">
            <NetworkSelector />
            <Link href="/profile" className="btn-ghost">Profile</Link>
            <Link href="/play" className="btn-primary btn-compact">
              Play Now
            </Link>
            <ConnectButton />
          </div>

          <div className="flex shrink-0 items-center gap-2 lg:hidden">
            <div className="hidden items-center gap-2 sm:flex">
              <NetworkSelector />
              <ConnectButton />
            </div>
            <button
              type="button"
              className="btn-ghost btn-compact"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="flap-mobile-menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink-blue)" strokeWidth="2">
              {menuOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M4 8h16M4 16h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div id="flap-mobile-menu" className="lg:hidden mt-3 rounded-xl border border-[var(--color-steel-gray)] bg-white/90 p-4 shadow-xl backdrop-blur-[16px] flex flex-col gap-1">
            <div className="mb-3 grid gap-3 sm:hidden">
              <NetworkSelector />
              <ConnectButton />
            </div>
            <div className="mb-2 h-px bg-[var(--color-steel-gray)] sm:hidden" />
            {[
              { label: "How It Works", href: "/#how-it-works" },
              { label: "Rewards", href: "/#rewards" },
              { label: "Leaderboard", href: "/leaderboard" },
              { label: "Profile", href: "/profile" },
            ].map((item) => (
              <Link key={item.label} href={item.href}
                className="btn-ghost"
                onClick={() => setMenuOpen(false)}>{item.label}</Link>
            ))}
            <div className="my-2 h-px bg-[var(--color-steel-gray)]" />
            <Link
              href="/play"
              className="btn-primary"
              onClick={() => setMenuOpen(false)}>Play Now</Link>
          </div>
        )}
      </div>
    </header>
  );
}
