"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { FlapEngine, type GameEventType } from "@/game/engine";
import type { Difficulty } from "@/game/settings";
import Link from "next/link";
import { BountyPill } from "@/components/BountyPill";
import { ClaimBountyPanel } from "@/components/ClaimBountyPanel";
import { ConnectButton } from "@/components/ConnectButton";
import { StartPlayPanel } from "@/components/StartPlayPanel";

export default function PlayPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<FlapEngine | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [gameState, setGameState] = useState<"menu" | "playing" | "over">("menu");
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // Load high score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("flap_highscore");
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  const handleGameEvent = useCallback(
    (type: GameEventType, data?: Record<string, unknown>) => {
      if (type === "score") {
        setScore(data?.score as number);
      } else if (type === "coin") {
        setCoins(data?.coins as number);
        setScore(data?.score as number);
      } else if (type === "death") {
        const finalScore = data?.score as number;
        setScore(finalScore);
        setCoins(data?.coins as number);
        setGameState("over");

        // Update high score
        const saved = localStorage.getItem("flap_highscore");
        const current = saved ? parseInt(saved, 10) : 0;
        if (finalScore > current) {
          localStorage.setItem("flap_highscore", String(finalScore));
          setHighScore(finalScore);
        }

        // Update game history
        const history = JSON.parse(localStorage.getItem("flap_history") || "[]");
        history.unshift({
          score: finalScore,
          coins: data?.coins,
          difficulty,
          timestamp: new Date().toISOString(),
        });
        localStorage.setItem("flap_history", JSON.stringify(history.slice(0, 50)));
      }
    },
    [difficulty]
  );

  const initEngine = useCallback(() => {
    if (!canvasRef.current) return;
    if (engineRef.current) engineRef.current.stop();

    const engine = new FlapEngine(canvasRef.current, difficulty, handleGameEvent);
    engineRef.current = engine;
    engine.drawFrame();
  }, [difficulty, handleGameEvent]);

  useEffect(() => {
    initEngine();
    return () => engineRef.current?.stop();
  }, [initEngine]);

  const handleTap = useCallback(() => {
    if (gameState === "over") {
      setGameState("menu");
      setScore(0);
      setCoins(0);
      engineRef.current?.restart();
      return;
    }

    if (gameState === "menu") {
      setGameState("playing");
    }

    engineRef.current?.flap();
  }, [gameState]);

  // Keyboard handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        handleTap();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleTap]);

  return (
    <div className="min-h-screen bg-ink-blue flex flex-col items-center justify-center p-4">
      {/* Back nav */}
      <div className="w-full max-w-[420px] mb-4 flex items-center justify-between gap-3 flex-wrap">
        <Link
          href="/"
          className="text-[14px] text-white/60 hover:text-white transition-colors flex items-center gap-2 no-underline"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
        <div className="flex items-center gap-2">
          <BountyPill />
          <ConnectButton />
        </div>
      </div>

      {/* Game container */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="rounded-2xl cursor-pointer touch-none"
          onClick={handleTap}
          onTouchStart={(e) => {
            e.preventDefault();
            handleTap();
          }}
          style={{
            maxWidth: "100%",
            height: "auto",
            boxShadow:
              "rgba(0, 0, 0, 0.3) 0px 40px 60px 0px, rgba(236, 101, 43, 0.1) 0px 0px 80px 0px",
          }}
        />

        {/* Menu overlay */}
        {gameState === "menu" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink-blue/50 backdrop-blur-sm rounded-2xl">
            <h2 className="text-[32px] font-semibold text-white mb-2 tracking-[-0.8px]">Flap</h2>
            <p className="text-[14px] text-white/60 mb-8">Tap to fly, earn cUSD</p>

            {/* Difficulty selector */}
            <div className="flex gap-2 mb-8">
              {(["chill", "normal", "beast"] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDifficulty(d);
                  }}
                  className={`px-4 py-2 rounded-lg text-[14px] font-medium transition-all ${
                    difficulty === d
                      ? "bg-action-orange text-white"
                      : "bg-white/10 text-white/60 hover:bg-white/20"
                  }`}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>

            <button
              onClick={handleTap}
              className="btn-primary px-10 py-3 text-[16px]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              Play — $0.05
            </button>

            {highScore > 0 && (
              <p className="text-[12px] text-white/40 mt-4 font-mono">
                High Score: {highScore}
              </p>
            )}
          </div>
        )}

        {/* Game over overlay (enhanced) */}
        {gameState === "over" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink-blue/70 backdrop-blur-sm rounded-2xl">
            <div className="card-surface p-8 text-center max-w-[320px] mx-4">
              <h2 className="text-[28px] font-semibold text-ink-blue mb-1 tracking-[-0.48px]">
                Game Over
              </h2>

              <div className="grid grid-cols-2 gap-4 my-6">
                <div className="card-surface-alt p-4 rounded-lg">
                  <div className="text-[24px] font-semibold text-ink-blue">{score}</div>
                  <div className="text-[11px] text-slate-text mt-1">Score</div>
                </div>
                <div className="card-surface-alt p-4 rounded-lg">
                  <div className="text-[24px] font-semibold text-ink-blue">{highScore}</div>
                  <div className="text-[11px] text-slate-text mt-1">Best</div>
                </div>
                <div className="card-surface-alt p-4 rounded-lg">
                  <div className="text-[24px] font-semibold text-success-moss">{coins}</div>
                  <div className="text-[11px] text-slate-text mt-1">Coins</div>
                </div>
                <div className="card-surface-alt p-4 rounded-lg">
                  <div className="text-[24px] font-semibold text-action-orange">
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </div>
                  <div className="text-[11px] text-slate-text mt-1">Mode</div>
                </div>
              </div>

              {score >= highScore && score > 0 && (
                <div className="text-[14px] text-action-orange font-medium mb-4">
                  🎉 New High Score!
                </div>
              )}

              <button
                onClick={handleTap}
                className="btn-primary w-full py-3 text-[14px] mb-3"
              >
                Play Again — $0.05
              </button>
              <Link
                href="/"
                className="block text-[14px] text-slate-text hover:text-ink-blue transition-colors no-underline"
              >
                Back to Home
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Bottom info */}
      <div className="w-full max-w-[420px] mt-4 flex items-center justify-between">
        <span className="text-[12px] text-white/30 font-mono">
          Mode: {difficulty}
        </span>
        <span className="text-[12px] text-white/30 font-mono">
          Free practice — stake below to play for sats-back.
        </span>
      </div>

      {/* Onchain stake-and-play */}
      <div className="w-full max-w-[420px] mt-6">
        <h3 className="text-[12px] uppercase tracking-widest text-white/50 font-mono mb-3">
          ▸ Stake & play
        </h3>
        <StartPlayPanel />
      </div>

      {/* Yesterday's bounty claim */}
      <div className="w-full max-w-[420px] mt-6">
        <h3 className="text-[12px] uppercase tracking-widest text-white/50 font-mono mb-3">
          ▸ Bounty
        </h3>
        <ClaimBountyPanel />
      </div>
    </div>
  );
}
