"use client";

import { useEffect, useState } from "react";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { useChainKind } from "@/chain/ChainProvider";
import { connectStacks, readStacksSession } from "@/chain/stacksSession";
import { useStacksWrite } from "@/chain/useStacksWrite";
import {
  FLAP_STX_DAILY_HOP_FN,
  FLAP_STX_DEPLOYER,
  FLAP_STX_HOP_CONTRACT,
} from "@/chain/stacksContracts";
import { flapAbi } from "@/lib/abi/flap";
import { FLAP_ADDRESS, isFlapDeployed } from "@/lib/wagmi";

const COOLDOWN_SEC = 21 * 60 * 60; // Flap.HOP_COOLDOWN

export function HopButton() {
  const { kind } = useChainKind();
  const { address, isConnected } = useAccount();
  const [nowSec, setNowSec] = useState(0);
  const [stxConnected, setStxConnected] = useState(false);
  const stx = useStacksWrite();

  useEffect(() => {
    const initial = window.setTimeout(() => setNowSec(Math.floor(Date.now() / 1000)), 0);
    const id = window.setInterval(() => setNowSec(Math.floor(Date.now() / 1000)), 60_000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    if (kind !== "stacks") return;
    setStxConnected(readStacksSession().isConnected);
  }, [kind]);

  const { data: last } = useReadContract({
    abi: flapAbi,
    address: FLAP_ADDRESS,
    functionName: "lastHop",
    args: address ? [address] : undefined,
    query: {
      enabled: kind === "celo" && isConnected && isFlapDeployed && !!address,
      refetchInterval: 60_000,
    },
  });

  const { data: run } = useReadContract({
    abi: flapAbi,
    address: FLAP_ADDRESS,
    functionName: "hopRun",
    args: address ? [address] : undefined,
    query: {
      enabled: kind === "celo" && isConnected && isFlapDeployed && !!address,
      refetchInterval: 60_000,
    },
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: mining, isSuccess } = useWaitForTransactionReceipt({ hash });

  const lastTs = typeof last === "bigint" ? Number(last) : 0;
  const secondsLeft = lastTs === 0 ? 0 : Math.max(0, lastTs + COOLDOWN_SEC - nowSec);
  const onCooldown = kind === "celo" && secondsLeft > 0;
  const runVal = run !== undefined ? Number(run) : 0;

  const canSubmitCelo =
    kind === "celo" && isConnected && isFlapDeployed && !onCooldown && !mining && !isPending;
  const canSubmitStacks = kind === "stacks" && !stx.pending;
  const canSubmit = kind === "celo" ? canSubmitCelo : canSubmitStacks;

  async function submit() {
    if (kind === "celo") {
      writeContract({
        abi: flapAbi,
        address: FLAP_ADDRESS,
        functionName: "dailyHop",
        args: [],
      });
      return;
    }
    let s = readStacksSession();
    if (!s.isConnected) {
      s = await connectStacks();
      setStxConnected(s.isConnected);
      if (!s.isConnected) return;
    }
    await stx.call({
      contractAddress: FLAP_STX_DEPLOYER,
      contractName: FLAP_STX_HOP_CONTRACT,
      functionName: FLAP_STX_DAILY_HOP_FN,
      args: [],
    });
  }

  const ctaCelo = mining
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

  const ctaStacks = stx.pending
    ? "Sign in wallet…"
    : stx.txid
      ? "Hopped on Stacks ✓"
      : stxConnected
        ? "Daily hop →"
        : "Connect Stacks to hop";

  const cta = kind === "celo" ? ctaCelo : ctaStacks;

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
