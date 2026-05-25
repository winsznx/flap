"use client";

import Link from "next/link";
import { useState } from "react";
import { NetworkSelector } from "./NetworkSelector";
import { ConnectButton } from "./ConnectButton";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-3 z-50 px-3">
      <div className="mx-auto max-w-[1200px]">
        <div className="nav-frame flex min-h-[72px] items-center justify-between gap-5 px-5 md:px-6">
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

          <nav className="hidden items-center gap-1 rounded-full bg-[var(--color-fog-gray)] p-1 md:flex">
            {[
              { label: "How It Works", href: "#how-it-works" },
              { label: "Rewards", href: "#rewards" },
              { label: "Leaderboard", href: "#leaderboard" },
            ].map((link) => (
              <Link key={link.label} href={link.href} className="nav-link">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden shrink-0 items-center gap-2 md:flex">
            <NetworkSelector />
            <Link href="/profile" className="btn-ghost">Profile</Link>
            <Link href="/play" className="btn-primary btn-compact">
              Play Now
            </Link>
            <ConnectButton />
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <NetworkSelector />
            <ConnectButton />
            <button
              type="button"
              className="btn-ghost btn-compact"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink-blue)" strokeWidth="2">
              {menuOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M4 8h16M4 16h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden mt-3 rounded-xl border border-[var(--color-steel-gray)] bg-white/90 p-4 shadow-xl backdrop-blur-[16px] flex flex-col gap-1">
            {["How It Works", "Rewards", "Leaderboard"].map((item) => (
              <Link key={item} href={`#${item.toLowerCase().replace(/ /g, "-")}`}
                className="btn-ghost"
                onClick={() => setMenuOpen(false)}>{item}</Link>
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
