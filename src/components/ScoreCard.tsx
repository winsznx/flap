type Props = {
  score: number;
  highScore?: number;
  payoutCusd?: string;
  className?: string;
};

/**
 * Big-score card used in the game-over modal + share card. Inflates the
 * number to the visual centerpiece so it screenshots cleanly.
 */
export function ScoreCard({ score, highScore, payoutCusd, className = "" }: Props) {
  return (
    <div
      className={`rounded-2xl border border-steel-gray bg-white p-6 text-center ${className}`}
    >
      <div className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--color-slate-text)" }}>
        Score
      </div>
      <div
        className="mt-1 text-5xl font-semibold tabular-nums leading-none"
        style={{ color: "var(--color-action-orange)" }}
      >
        {score}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-left">
        {highScore !== undefined && (
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--color-slate-text)" }}>
              high score
            </div>
            <div className="mt-1 text-sm tabular-nums" style={{ color: "var(--color-ink-blue)" }}>
              {highScore}
            </div>
          </div>
        )}
        {payoutCusd && (
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--color-slate-text)" }}>
              payout
            </div>
            <div className="mt-1 text-sm tabular-nums" style={{ color: "var(--color-success-moss)" }}>
              {payoutCusd} cUSD
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
