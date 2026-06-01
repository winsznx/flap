import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TodayLeaderboard } from "@/components/TodayLeaderboard";
import { OnchainLeaderboard } from "@/components/OnchainLeaderboard";

export const metadata = {
  title: "Leaderboard — Flap",
  description: "Top pilots on Flap, ranked by total on-chain actions on Celo and Stacks. The contracts are the source of truth.",
};

export default function LeaderboardPage() {
  return (
    <main className="app-shell">
      <Header />
      <div className="container-page pb-16 pt-36 md:pb-20">
        <header className="mb-10 md:mb-14">
          <span className="eyebrow">Live · onchain</span>
          <h1 className="mt-3 display-lg">Top pilots</h1>
          <p className="mt-4 max-w-2xl body-lg">
            Ranked by total on-chain actions on the Flap contracts — plays opened, scores reported, settlements, daily hops, bounty claims, and badge mints. Toggle Celo (cUSD) or Stacks (STX) to switch the source chain.
          </p>
        </header>

        <section className="mb-14 md:mb-20">
          <div className="flex items-baseline justify-between mb-4 sm:mb-5">
            <h2 className="heading-md">All-time rankings</h2>
            <span className="eyebrow text-[var(--color-slate-text)]">by total actions</span>
          </div>
          <OnchainLeaderboard />
        </section>

        <section>
          <div className="flex items-baseline justify-between mb-4 sm:mb-5">
            <h2 className="heading-md">Today&apos;s payouts</h2>
            <span className="eyebrow text-[var(--color-slate-text)]">from PlaySettled wins</span>
          </div>
          <TodayLeaderboard />
        </section>

        <div className="mt-10 flex items-center justify-between text-sm text-slate-text">
          <span className="font-mono text-xs">celo 0xf4bf…1c70 · stacks SP31…WYV.flap</span>
          <Link href="/play" className="btn-primary btn-compact">
            Stake & fly
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
