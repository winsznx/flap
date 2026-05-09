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

const STAKE_PRESETS = [0.05, 0.1, 0.25, 0.5];

/**
 * Stake-and-go play opener. Approves cUSD only when the existing allowance
 * doesn't cover the chosen stake. Player gets a playId on confirm; the actual
 * gameplay stays client-side, score reporting is handled by the off-chain
 * scorer key.
 */
export function StartPlayPanel() {
  const { address, isConnected } = useAccount();
  const [stake, setStake] = useState<number>(0.1);
  const [phase, setPhase] = useState<"idle" | "approving" | "starting">("idle");
  const stakeWei = parseUnits(stake.toString(), 18);

  const { data: allowance } = useReadContract({
    abi: erc20Abi,
    address: CUSD_ADDRESS,
    functionName: "allowance",
    args: address ? [address, FLAP_ADDRESS] : undefined,
    query: { enabled: isConnected && isFlapDeployed && !!address },
  });

  const { writeContract, data: hash, reset, isPending } = useWriteContract();
  const { isLoading: mining, data: receipt } = useWaitForTransactionReceipt({ hash });

  const needsApprove = !allowance || (allowance as bigint) < stakeWei;
  const enabled = isConnected && isFlapDeployed && !mining && !isPending;

  function start() {
    if (!isConnected) return;
    if (needsApprove) {
      setPhase("approving");
      writeContract({
        abi: erc20Abi,
        address: CUSD_ADDRESS,
        functionName: "approve",
        args: [FLAP_ADDRESS, stakeWei],
      });
      return;
    }
    setPhase("starting");
    writeContract({
      abi: flapAbi,
      address: FLAP_ADDRESS,
      functionName: "startPlay",
      args: [stakeWei],
    });
  }

  const cta = mining
    ? phase === "approving"
      ? "Approving stake…"
      : "Opening play…"
    : needsApprove
      ? `Approve $${stake} cUSD`
      : `Stake $${stake} & fly →`;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div>
        <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">Per-play stake</div>
        <div className="flex flex-wrap gap-2">
          {STAKE_PRESETS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStake(s)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                stake === s
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 text-slate-700 hover:border-slate-500"
              }`}
            >
              ${s}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={start}
        disabled={!enabled}
        className="w-full px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium disabled:opacity-40"
      >
        {cta}
      </button>

      {hash && (
        <div className="text-xs text-slate-500 flex items-center gap-2">
          tx: {hash.slice(0, 10)}…
          <button type="button" onClick={() => reset()} className="underline">
            reset
          </button>
        </div>
      )}
      {receipt && (
        <p className="text-xs text-emerald-600">
          Play opened. Hit the threshold to win 2× back; miss it and your stake feeds today&apos;s
          bounty pool.
        </p>
      )}

      {!isConnected && <p className="text-xs text-slate-500">Connect a wallet to stake.</p>}
      {isConnected && !isFlapDeployed && (
        <p className="text-xs text-amber-600">
          Flap contract not yet deployed — set NEXT_PUBLIC_FLAP_ADDRESS at build time.
        </p>
      )}
    </div>
  );
}
