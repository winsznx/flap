"use client";

import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { flapAbi } from "@/lib/abi/flap";
import { FLAP_ADDRESS, isFlapDeployed } from "@/lib/wagmi";

const COOLDOWN_SEC = 21 * 60 * 60; // Flap.HOP_COOLDOWN

export function HopButton() {
  const { address, isConnected } = useAccount();

  const { data: last } = useReadContract({
    abi: flapAbi,
    address: FLAP_ADDRESS,
    functionName: "lastHop",
    args: address ? [address] : undefined,
    query: { enabled: isConnected && isFlapDeployed && !!address, refetchInterval: 60_000 },
  });

  const { data: run } = useReadContract({
    abi: flapAbi,
    address: FLAP_ADDRESS,
    functionName: "hopRun",
    args: address ? [address] : undefined,
    query: { enabled: isConnected && isFlapDeployed && !!address, refetchInterval: 60_000 },
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: mining, isSuccess } = useWaitForTransactionReceipt({ hash });

  const lastTs = typeof last === "bigint" ? Number(last) : 0;
  const nowSec = Math.floor(Date.now() / 1000);
  const secondsLeft = lastTs === 0 ? 0 : Math.max(0, lastTs + COOLDOWN_SEC - nowSec);
  const onCooldown = secondsLeft > 0;
  const runVal = run !== undefined ? Number(run) : 0;

  const canSubmit = isConnected && isFlapDeployed && !onCooldown && !mining && !isPending;

  function submit() {
    writeContract({
      abi: flapAbi,
      address: FLAP_ADDRESS,
      functionName: "dailyHop",
      args: [],
    });
  }

  const cta = mining
    ? "Hopping…"
    : isPending
      ? "Sign…"
      : isSuccess
        ? "Hopped ✓"
        : onCooldown
          ? fmt(secondsLeft)
          : !isConnected
            ? "Connect to hop"
            : !isFlapDeployed
              ? "Contract offline"
              : "Daily hop →";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between gap-3">
      <div>
        <div className="text-xs uppercase tracking-widest text-slate-500">Hop run</div>
        <div className="text-2xl font-bold text-slate-900">{runVal}</div>
      </div>
      <button
        type="button"
        onClick={submit}
        disabled={!canSubmit}
        className="px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-40"
      >
        {cta}
      </button>
    </div>
  );
}

function fmt(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `Wait ${h}h ${m}m` : `Wait ${m}m`;
}
