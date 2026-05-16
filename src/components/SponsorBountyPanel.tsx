"use client";

import { useState } from "react";
import { erc20Abi, parseUnits } from "viem";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { flapAbi } from "@/lib/abi/flap";
import { CUSD_ADDRESS, FLAP_ADDRESS, isFlapDeployed } from "@/lib/wagmi";

const PRESETS = [1, 5, 10, 25];

/**
 * Anyone can sponsor a future-or-current day's bounty pool. Reads today() so
 * the default targets the live day. Two-step approve + sponsorDailyBounty;
 * skips the approve when allowance already covers.
 */
export function SponsorBountyPanel() {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState<number>(5);
  const [phase, setPhase] = useState<"idle" | "approving" | "sponsoring">("idle");

  const { data: today } = useReadContract({
    abi: flapAbi,
    address: FLAP_ADDRESS,
    functionName: "today",
    query: { enabled: isFlapDeployed, refetchInterval: 60_000 },
  });

  const wei = parseUnits(amount.toString(), 18);

  const { data: allowance } = useReadContract({
    abi: erc20Abi,
    address: CUSD_ADDRESS,
    functionName: "allowance",
    args: address ? [address, FLAP_ADDRESS] : undefined,
    query: { enabled: isConnected && isFlapDeployed && !!address },
  });

  const { writeContract, data: hash, reset, isPending } = useWriteContract();
  const { isLoading: mining, isSuccess } = useWaitForTransactionReceipt({ hash });

  const needsApprove = !allowance || (allowance as bigint) < wei;
  const enabled = isConnected && isFlapDeployed && !mining && !isPending && today !== undefined;

  function submit() {
    if (today === undefined) return;
    if (needsApprove) {
      setPhase("approving");
      writeContract({
        abi: erc20Abi,
        address: CUSD_ADDRESS,
        functionName: "approve",
        args: [FLAP_ADDRESS, wei],
      });
      return;
    }
    setPhase("sponsoring");
    writeContract({
      abi: flapAbi,
      address: FLAP_ADDRESS,
      functionName: "sponsorDailyBounty",
      args: [today, wei],
    });
  }

  const cta = mining
    ? phase === "approving"
      ? "Approving…"
      : "Topping up…"
    : isSuccess
      ? "Bounty topped up ✓"
      : !isConnected
        ? "Connect to sponsor"
        : !isFlapDeployed
          ? "Contract not deployed"
          : needsApprove
            ? `Approve $${amount}`
            : `Top up $${amount} →`;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Sponsor today&apos;s pot</h3>
        <span className="text-[11px] uppercase tracking-widest text-slate-500 font-mono">
          DAY {today !== undefined ? today.toString() : "—"}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setAmount(p)}
            className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
              amount === p
                ? "border-amber-500 bg-amber-50 text-amber-700"
                : "border-slate-300 text-slate-700 hover:border-slate-500"
            }`}
          >
            ${p}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={!enabled}
        className="w-full px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium disabled:opacity-40"
      >
        {cta}
      </button>

      {hash && (
        <div className="flex justify-between items-center text-xs text-slate-500">
          <span>tx: {hash.slice(0, 10)}…</span>
          <button type="button" onClick={() => reset()} className="underline">
            reset
          </button>
        </div>
      )}

      <p className="text-xs text-slate-500">
        Anyone can sponsor. The day&apos;s top scorer claims the pool once owner finalizes the day.
      </p>
    </div>
  );
}
