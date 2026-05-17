import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Leaderboard } from "@/components/Leaderboard";
import { TodayLeaderboard } from "@/components/TodayLeaderboard";

export const metadata = {
  title: "Leaderboard — Flap",
  description: "Today's top pilots on Flap. See who's leading the daily prize pool.",
};

export default function LeaderboardPage() {
  return (
    <main className="min-h-screen bg-ghost-white">
      <Header />
      <div className="pt-20 max-w-4xl mx-auto px-6">
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-slate-900">Today on-chain</h2>
            <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">
              recent PlaySettled wins
            </span>
          </div>
          <TodayLeaderboard />
        </section>
      </div>
      <div className="pt-4">
        <Leaderboard />
      </div>
      <Footer />
    </main>
  );
}
