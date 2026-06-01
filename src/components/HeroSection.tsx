"use client";

import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pb-16 pt-32 md:pb-24 md:pt-40">
      <div className="absolute inset-0 grid-pattern" aria-hidden />
      <div className="absolute inset-0 hero-glow" aria-hidden />

      <div className="container-page relative grid items-center gap-12 lg:grid-cols-[1fr_360px]">
        <div className="max-w-4xl">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="badge badge-success">
              <span
                className="h-1.5 w-1.5 rounded-full animate-pulse-dot"
                style={{ background: "var(--color-success-moss)" }}
              />
              Live on Celo + Stacks
            </span>
            <span className="badge badge-subtle">MiniPay + Leather native</span>
            <span className="badge badge-subtle">Instant settlement</span>
          </div>

          <h1 className="display-xl">
            Tap to fly.
            <br />
            <span className="gradient-text">Earn cUSD or STX.</span>
          </h1>

          <p className="mt-6 max-w-2xl body-lg">
            Flap is an onchain arcade game where every staked run can settle into daily rewards.
            Dodge pipes, collect coins, and keep the game loop fast enough for mobile wallets.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/play" className="btn-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M8 5v14l11-7z" />
              </svg>
              Play Now · $0.05
            </Link>
            <Link href="#how-it-works" className="btn-secondary">
              How it works
            </Link>
          </div>

          <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
            {[
              ["Verified", "Contract-backed runs"],
              ["Fast", "Mobile-first canvas"],
              ["Fair", "Daily prize pools"],
            ].map(([label, value]) => (
              <div key={label} className="surface-panel p-4">
                <div className="eyebrow">{label}</div>
                <div className="mt-1 text-sm font-medium text-[var(--color-ink-blue)]">{value}</div>
              </div>
            ))}
          </div>
        </div>

        <GamePreview />
      </div>
    </section>
  );
}

function GamePreview() {
  return (
    <div className="mx-auto w-full max-w-[330px] animate-float">
      <div className="overflow-hidden rounded-[24px] border border-[var(--color-steel-gray)] bg-white p-3 shadow-xl">
        <div className="relative h-[500px] overflow-hidden rounded-[18px] bg-gradient-to-b from-sky-300 via-sky-100 to-emerald-100">
          <div className="absolute left-7 top-8 h-5 w-20 rounded-full bg-white/55" />
          <div className="absolute right-7 top-20 h-4 w-24 rounded-full bg-white/40" />

          <Pipe top left="20%" height="31%" />
          <Pipe bottom left="20%" height="28%" />
          <Pipe top left="72%" height="22%" />
          <Pipe bottom left="72%" height="38%" />

          <div className="absolute left-1/2 top-[40%] -translate-x-1/2">
            <div className="relative h-12 w-12 rounded-full bg-gradient-to-br from-yellow-200 to-yellow-500 shadow-[0_8px_28px_rgba(255,193,7,0.45)]">
              <div className="absolute right-2 top-2 h-4 w-4 rounded-full bg-white">
                <div className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[var(--color-ink-blue)]" />
              </div>
              <div className="absolute -right-2 top-4 h-0 w-0 border-y-[5px] border-l-[10px] border-y-transparent border-l-[var(--color-action-orange)]" />
            </div>
          </div>

          <div className="absolute left-1/2 top-6 -translate-x-1/2 text-4xl font-bold text-white drop-shadow">
            24
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-14 bg-[#795548]">
            <div className="h-1.5 bg-[var(--color-success-moss)]" />
          </div>
          <div className="absolute bottom-6 left-0 right-0 flex justify-center">
            <span className="rounded-full bg-[rgba(1,24,33,0.74)] px-4 py-2 text-xs font-medium text-white backdrop-blur">
              Tap anywhere to play
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Pipe({
  top,
  bottom,
  left,
  height,
}: {
  top?: boolean;
  bottom?: boolean;
  left: string;
  height: string;
}) {
  return (
    <div
      className={`absolute w-12 bg-gradient-to-r from-green-800 via-green-600 to-green-800 ${
        top ? "top-0 rounded-b" : ""
      } ${bottom ? "bottom-14 rounded-t" : ""}`}
      style={{ left, height }}
    >
      <div
        className={`absolute left-[-4px] right-[-4px] h-5 bg-green-900 ${
          top ? "bottom-0" : "top-0"
        }`}
      />
    </div>
  );
}
