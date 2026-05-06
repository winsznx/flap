import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Leaderboard } from "@/components/Leaderboard";

export const metadata = {
  title: "Leaderboard — Flap",
  description: "Today's top pilots on Flap. See who's leading the daily prize pool.",
};

export default function LeaderboardPage() {
  return (
    <main className="min-h-screen bg-ghost-white">
      <Header />
      <div className="pt-20">
        <Leaderboard />
      </div>
      <Footer />
    </main>
  );
}
