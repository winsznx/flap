"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OnchainProfile } from "@/components/OnchainProfile";

interface GameRecord {
  score: number;
  coins: number;
  difficulty: string;
  timestamp: string;
}

export default function ProfilePage() {
  const [history, setHistory] = useState<GameRecord[]>([]);
  const [highScore, setHighScore] = useState(0);
  const [totalGames, setTotalGames] = useState(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("flap_history");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setHistory(parsed as GameRecord[]);
          setTotalGames(parsed.length);
        }
      }
      const hs = localStorage.getItem("flap_highscore");
      if (hs) {
        const n = parseInt(hs, 10);
        if (Number.isFinite(n)) setHighScore(n);
      }
    } catch {
      // localStorage shape is from an older client or got corrupted — fall through to empty.
    }
  }, []);

  const totalCoins = history.reduce((sum, g) => sum + (g.coins || 0), 0);
  const avgScore = totalGames > 0
    ? Math.round(history.reduce((sum, g) => sum + g.score, 0) / totalGames)
    : 0;

  return (
    <main className="min-h-screen bg-ghost-white">
      <Header />
      <div className="pt-24 pb-20 max-w-[800px] mx-auto px-6">
        {/* Profile header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-full bg-fog-gray border-2 border-steel-gray mx-auto mb-4 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-slate-text)" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h1 className="text-[28px] font-semibold text-ink-blue tracking-[-0.48px]">Your Profile</h1>
          <p className="text-[14px] text-slate-text mt-1">Connect wallet to save progress on-chain</p>
        </div>

        {/* On-chain stats first — permanent record */}
        <OnchainProfile />

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: "High Score", value: highScore, icon: "🏆" },
            { label: "Games Played", value: totalGames, icon: "🎮" },
            { label: "Coins Collected", value: totalCoins, icon: "💰" },
            { label: "Avg Score", value: avgScore, icon: "📊" },
          ].map((stat) => (
            <div key={stat.label} className="card-surface p-5 text-center">
              <div className="text-[20px] mb-2">{stat.icon}</div>
              <div className="text-[24px] font-semibold text-ink-blue">{stat.value}</div>
              <div className="text-[11px] text-slate-text mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Game history */}
        <div className="card-surface overflow-hidden">
          <div className="px-6 py-4 bg-fog-gray border-b border-steel-gray flex items-center justify-between">
            <h3 className="text-[16px] font-semibold text-ink-blue">Game History</h3>
            <span className="text-[12px] text-slate-text font-mono">Last {history.length} games</span>
          </div>

          {history.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-[14px] text-slate-text">No games played yet</p>
              <a href="/play" className="btn-primary mt-4 inline-flex text-[14px]">Play Your First Game</a>
            </div>
          ) : (
            <div className="divide-y divide-steel-gray/50">
              {history.slice(0, 20).map((game, i) => (
                <div key={i} className="px-6 py-3 flex items-center justify-between hover:bg-fog-gray/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-[12px] text-slate-text font-mono w-6">#{i + 1}</span>
                    <div>
                      <span className="text-[14px] font-medium text-ink-blue">Score: {game.score}</span>
                      <span className="text-[12px] text-slate-text ml-3">💰 {game.coins || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                      game.difficulty === "beast"
                        ? "bg-action-orange/10 text-action-orange"
                        : game.difficulty === "chill"
                        ? "bg-success-moss/10 text-success-moss"
                        : "bg-deep-plum/10 text-deep-plum"
                    }`}>
                      {game.difficulty}
                    </span>
                    <span className="text-[11px] text-slate-text font-mono">
                      {new Date(game.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
