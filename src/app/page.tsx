import Link from "next/link";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { HowItWorks } from "@/components/HowItWorks";
import { StatsBar } from "@/components/StatsBar";
import { Leaderboard } from "@/components/Leaderboard";
import { DailyRewards } from "@/components/DailyRewards";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-ghost-white">
      <Header />
      <HeroSection />
      <StatsBar />
      <HowItWorks />
      <DailyRewards />
      <Leaderboard />
      <Footer />
    </main>
  );
}
