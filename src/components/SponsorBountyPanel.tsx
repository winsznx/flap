"use client";

import { useEffect, useState } from "react";
import { erc20Abi, parseUnits } from "viem";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { useChainKind } from "@/chain/ChainProvider";
import { CeloOnlyNotice } from "@/components/CeloOnlyNotice";
import { flapAbi } from "@/lib/abi/flap";
import { CUSD_ADDRESS, FLAP_ADDRESS, isFlapDeployed } from "@/lib/wagmi";

const PRESETS = [1, 5, 10, 25];

/**
 * Anyone can sponsor a future-or-current day's bounty pool. Reads today() so
 * the default targets the live day. Two-step approve + sponsorDailyBounty;
 * skips the approve when allowance already covers.
 */
export function SponsorBountyPanel() {
  const { kind } = useChainKind();

  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState<number>(5);
  const [phase, setPhase] = useState<"idle" | "approving" | "sponsoring">("idle");

  const { data: today, refetch: refetchToday } = useReadContract({
    abi: flapAbi,
    address: FLAP_ADDRESS,
    functionName: "today",
    query: { enabled: isFlapDeployed, refetchInterval: 60_000 },
  });

  const wei = (() => {
    if (!(amount > 0)) return 0n;
    try {
      return parseUnits(amount.toString(), 18);
    } catch {
      return 0n;
    }
  })();

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    abi: erc20Abi,
    address: CUSD_ADDRESS,
    functionName: "allowance",
    args: address ? [address, FLAP_ADDRESS] : undefined,
    query: { enabled: isConnected && isFlapDeployed && !!address },
  });

  const { writeContract, data: hash, reset, isPending, error: writeError } =
    useWriteContract();
  const { isLoading: mining, isSuccess } = useWaitForTransactionReceipt({
    hash,
    query: { enabled: !!hash },
  });

  // Refetch allowance after the approve receipt confirms so the next click
  // fires sponsorDailyBounty instead of sending another approve. Drop phase to
  // idle once the sponsor receipt lands so the next top-up doesn't start in a
  // stale "Topping up…" CTA.
  useEffect(() => {
    if (isSuccess && phase === "approving") {
      void refetchAllowance();
      setPhase("sponsoring");
    } else if (isSuccess && phase === "sponsoring") {
      setPhase("idle");
    }
  }, [isSuccess, phase, refetchAllowance]);

  // Also drop phase to idle on writeContract error so the CTA doesn't stay
  // stuck on "Approving…" / "Topping up…" after the wallet rejects.
  useEffect(() => {
    if (writeError) setPhase("idle");
  }, [writeError]);

  // Reset wagmi state on chain flip — Stacks branch shows a celo-only notice
  // and shouldn't carry a stale Celo hash or phase.
  useEffect(() => {
    reset();
    setPhase("idle");
  }, [kind, reset]);

  const needsApprove = !allowance || (allowance as bigint) < wei;
  const enabled = isConnected && isFlapDeployed && !mining && !isPending && today !== undefined;

  async function submit() {
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
    // The day index is cached at 60s, but day boundaries (and finalize calls)
    // can land mid-window. Re-read today right before sponsoring so a stale
    // cache doesn't credit yesterday's pool when the day just rolled — that
    // sponsorship would land on a day the user didn't intend.
    let dayArg = today;
    try {
      const fresh = await refetchToday();
      if (fresh.data !== undefined) dayArg = fresh.data;
    } catch {
      /* fall through with cached today */
    }
    setPhase("sponsoring");
    writeContract({
      abi: flapAbi,
      address: FLAP_ADDRESS,
      functionName: "sponsorDailyBounty",
      args: [dayArg, wei],
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

  if (kind === "stacks") {
    return <CeloOnlyNotice feature="Sponsor Bounty" />;
  }

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
            aria-pressed={amount === p}
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
        aria-busy={mining || isPending}
        className="w-full px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium disabled:opacity-40"
      >
        {cta}
      </button>

      {hash && (
        <div className="flex justify-between items-center text-xs text-slate-500">
          <a
            href={`https://celoscan.io/tx/${hash}`}
            target="_blank"
            rel="noreferrer"
            className="text-action-orange underline"
          >
            view tx ↗ <span className="font-mono">({hash.slice(0, 10)}…)</span>
          </a>
          <button type="button" onClick={() => reset()} className="underline">
            reset
          </button>
        </div>
      )}
      {writeError && (
        <p className="text-xs text-red-600">{writeError.message.split("\n")[0]}</p>
      )}

      <p className="text-xs text-slate-500">
        Anyone can sponsor. The day&apos;s top scorer claims the pool once owner finalizes the day.
      </p>
    </div>
  );
}
