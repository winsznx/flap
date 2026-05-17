import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TodayLeaderboard } from "@/components/TodayLeaderboard";

export const metadata = {
  title: "Leaderboard — Flap",
  description: "Today's top pilots on Flap, ranked by on-chain payout from PlaySettled wins.",
};

export default function LeaderboardPage() {
  return (
    <main className="min-h-screen bg-ghost-white">
      <Header />
      <div className="pt-24 pb-20 max-w-4xl mx-auto px-6">
        <header className="mb-10">
          <span className="text-xs font-mono text-action-orange uppercase tracking-widest">
            Live · on-chain
          </span>
          <h1 className="text-3xl md:text-4xl font-semibold text-ink-blue mt-2 tracking-tight">
            Today&apos;s top pilots
          </h1>
          <p className="text-slate-text mt-2 max-w-md">
            Wins from the most recent PlaySettled events, ranked by payout. Earn a slot here by
            beating today&apos;s score threshold.
          </p>
        </header>

        <TodayLeaderboard />

        <div className="mt-10 flex items-center justify-between text-sm text-slate-text">
          <span className="font-mono text-xs">indexed from the last ~50k blocks</span>
          <Link href="/play" className="text-action-orange hover:underline font-medium">
            Stake & fly →
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
