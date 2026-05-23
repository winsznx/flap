import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TodayLeaderboard } from "@/components/TodayLeaderboard";
import { OnchainLeaderboard } from "@/components/OnchainLeaderboard";

export const metadata = {
  title: "Leaderboard — Flap",
  description: "Top pilots on Flap, ranked by total on-chain actions. The contract is the source of truth.",
};

export default function LeaderboardPage() {
  return (
    <main className="min-h-screen bg-ghost-white">
      <Header />
      <div className="pt-28 sm:pt-32 md:pt-36 pb-16 md:pb-20 max-w-5xl w-full mx-auto px-5 sm:px-6">
        <header className="mb-10 md:mb-14">
          <span className="text-[11px] font-mono uppercase tracking-[0.15em]" style={{ color: "var(--color-action-orange)" }}>
            Live · onchain
          </span>
          <h1 className="text-[32px] sm:text-4xl md:text-5xl font-semibold mt-2 tracking-tight" style={{ color: "var(--color-ink-blue)" }}>
            Top pilots
          </h1>
          <p className="mt-3 max-w-xl text-base sm:text-lg" style={{ color: "var(--color-slate-text)" }}>
            Ranked by total on-chain actions on the Flap contract — plays opened, scores reported, settlements, daily hops, bounty claims, and badge mints. The contract is the source of truth.
          </p>
        </header>

        <section className="mb-14 md:mb-20">
          <div className="flex items-baseline justify-between mb-4 sm:mb-5">
            <h2 className="text-xl sm:text-2xl font-semibold" style={{ color: "var(--color-ink-blue)" }}>
              All-time rankings
            </h2>
            <span className="font-mono text-xs uppercase tracking-widest" style={{ color: "var(--color-slate-text)" }}>
              by total actions
            </span>
          </div>
          <OnchainLeaderboard />
        </section>

        <section>
          <div className="flex items-baseline justify-between mb-4 sm:mb-5">
            <h2 className="text-xl sm:text-2xl font-semibold" style={{ color: "var(--color-ink-blue)" }}>
              Today&apos;s payouts
            </h2>
            <span className="font-mono text-xs uppercase tracking-widest" style={{ color: "var(--color-slate-text)" }}>
              from PlaySettled wins
            </span>
          </div>
          <TodayLeaderboard />
        </section>

        <div className="mt-10 flex items-center justify-between text-sm" style={{ color: "var(--color-slate-text)" }}>
          <span className="font-mono text-xs">contract: 0xf4bf…1c70</span>
          <Link href="/play" className="font-medium hover:underline" style={{ color: "var(--color-action-orange)" }}>
            Stake & fly →
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
