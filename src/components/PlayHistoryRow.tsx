import { TxLink } from "./TxLink";
import { Pill } from "./Pill";

type Props = {
  playId: bigint | number | string;
  score: number;
  stakeCusd: string;
  outcome: "win" | "lose" | "pending";
  hash?: string;
  ts?: number;
};

const OUTCOME_LABEL: Record<Props["outcome"], string> = {
  win: "Won",
  lose: "Bounty",
  pending: "Pending",
};

export function PlayHistoryRow({ playId, score, stakeCusd, outcome, hash, ts }: Props) {
  return (
    <li className="grid grid-cols-[1fr_70px_90px_90px] items-center gap-3 border-b border-steel-gray px-1 py-3 last:border-b-0">
      <div className="min-w-0">
        <div className="font-mono text-[11px] uppercase tracking-widest" style={{ color: "var(--color-slate-text)" }}>
          play · {playId.toString()}
        </div>
        {hash && (
          <div className="mt-0.5">
            <TxLink hash={hash} />
          </div>
        )}
      </div>
      <div className="text-right font-mono tabular-nums text-sm" style={{ color: "var(--color-ink-blue)" }}>
        {score}
      </div>
      <div className="text-right font-mono tabular-nums text-sm" style={{ color: "var(--color-slate-text)" }}>
        {stakeCusd}
      </div>
      <div className="flex justify-end">
        <Pill tone={outcome === "win" ? "win" : outcome === "lose" ? "lose" : "info"}>
          {OUTCOME_LABEL[outcome]}
        </Pill>
      </div>
      {ts && (
        <div className="col-span-4 font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--color-slate-text)" }}>
          {new Date(ts * 1000).toLocaleString()}
        </div>
      )}
    </li>
  );
}
