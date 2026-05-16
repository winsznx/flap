"use client";

import { useMemo, useState } from "react";
import { useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { flapAbi } from "@/lib/abi/flap";
import { FLAP_ADDRESS, isFlapDeployed } from "@/lib/wagmi";

/**
 * settlePlay is permissionless once a score has been submitted, so any wallet
 * can finalize an open play. Reads the play to gate the button on
 * `state === Open && score > 0`.
 */
export function SettlePlayButton() {
  const [input, setInput] = useState("");

  const playId = useMemo(() => {
    if (!input.trim()) return undefined;
    try {
      return BigInt(input.trim());
    } catch {
      return undefined;
    }
  }, [input]);

  const { data: play, refetch } = useReadContract({
    abi: flapAbi,
    address: FLAP_ADDRESS,
    functionName: "getPlay",
    args: playId !== undefined ? [playId] : undefined,
    query: { enabled: isFlapDeployed && playId !== undefined, refetchInterval: 20_000 },
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: mining, isSuccess } = useWaitForTransactionReceipt({ hash });

  const isOpen = play?.state === 1; // PlayState.Open
  const hasScore = play && play.score > 0n;

  const canSubmit =
    isFlapDeployed && play && isOpen && hasScore && !mining && !isPending;

  function submit() {
    if (playId === undefined) return;
    writeContract({
      abi: flapAbi,
      address: FLAP_ADDRESS,
      functionName: "settlePlay",
      args: [playId],
    });
    setTimeout(() => refetch().catch(() => undefined), 6_000);
  }

  const stateLabel = (() => {
    if (!play) return "—";
    if (play.state === 1) return hasScore ? "Open, scored — settle now" : "Open, awaiting score";
    if (play.state === 2) return "Settled ✓";
    if (play.state === 3) return "Cancelled";
    return "None";
  })();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Settle a play</h3>
        <span className="text-[11px] uppercase tracking-widest text-slate-500 font-mono">
          permissionless
        </span>
      </div>
      <input
        type="text"
        inputMode="numeric"
        placeholder="play id"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-slate-400"
      />
      <div className="text-xs text-slate-500">{stateLabel}</div>
      <button
        type="button"
        onClick={submit}
        disabled={!canSubmit}
        className="w-full px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium disabled:opacity-40"
      >
        {mining ? "Settling…" : isSuccess ? "Settled ✓" : "Settle play"}
      </button>
    </div>
  );
}
