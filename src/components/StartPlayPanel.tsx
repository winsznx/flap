"use client";

import { useEffect, useMemo, useState } from "react";
import { erc20Abi, parseEventLogs, parseUnits } from "viem";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { useChainKind } from "@/chain/ChainProvider";
import { connectStacks, readStacksSession } from "@/chain/stacksSession";
import { useStacksWrite } from "@/chain/useStacksWrite";
import {
  FLAP_STX_CONTRACT,
  FLAP_STX_DEPLOYER,
  FLAP_STX_START_PLAY_FN,
} from "@/chain/stacksContracts";
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
  const { kind } = useChainKind();
  const { address, isConnected } = useAccount();
  const [stake, setStake] = useState<number>(0.1);
  const [phase, setPhase] = useState<"idle" | "approving" | "starting">("idle");
  const stakeWei = parseUnits(stake.toString(), 18);
  const stx = useStacksWrite();

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    abi: erc20Abi,
    address: CUSD_ADDRESS,
    functionName: "allowance",
    args: address ? [address, FLAP_ADDRESS] : undefined,
    query: { enabled: kind === "celo" && isConnected && isFlapDeployed && !!address },
  });

  const { writeContract, data: hash, reset, isPending, error: writeError } =
    useWriteContract();
  const { isLoading: mining, isSuccess: confirmed, data: receipt } = useWaitForTransactionReceipt({
    hash,
    query: { enabled: !!hash },
  });

  // Refetch allowance after the approve receipt confirms so the next click
  // fires Flap.startPlay instead of sending another approve. Once the start
  // receipt lands drop phase to idle so the next click starts clean.
  useEffect(() => {
    if (confirmed && phase === "approving") {
      void refetchAllowance();
      setPhase("starting");
    } else if (confirmed && phase === "starting") {
      setPhase("idle");
    }
  }, [confirmed, phase, refetchAllowance]);

  // Reset every per-tx state knob when the user flips chain — without this a
  // mid-flight Celo "Approving…" CTA leaks into the Stacks tab.
  const stxReset = stx.reset;
  useEffect(() => {
    reset();
    stxReset();
    setPhase("idle");
  }, [kind, reset, stxReset]);

  // Drop phase on wallet reject / contract revert so the next click starts
  // clean instead of inheriting the stale CTA copy.
  useEffect(() => {
    if (writeError || stx.error) setPhase("idle");
  }, [writeError, stx.error]);

  // Parse PlayOpened from the receipt so the user gets the playId they need
  // for the Settle / Cancel panels — without this they have to scrape the
  // log themselves and the post-start UX dead-ends.
  const playId = useMemo<bigint | null>(() => {
    if (!receipt) return null;
    try {
      const events = parseEventLogs({
        abi: flapAbi,
        eventName: "PlayOpened",
        logs: receipt.logs,
      });
      const ev = events[0];
      if (ev && "args" in ev) {
        return (ev.args as { playId: bigint }).playId;
      }
    } catch {
      /* ignore parse errors — receipt may carry the approve, not PlayOpened */
    }
    return null;
  }, [receipt]);

  const needsApprove = kind === "celo" && (!allowance || (allowance as bigint) < stakeWei);
  const enabledCelo = isConnected && isFlapDeployed && !mining && !isPending;
  const enabledStacks = !stx.pending;
  const enabled = kind === "celo" ? enabledCelo : enabledStacks;

  async function start() {
    if (kind === "celo") {
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
      return;
    }

    let s = readStacksSession();
    if (!s.isConnected) {
      s = await connectStacks();
      if (!s.isConnected) return;
    }
    const stakeMicroStx = BigInt(Math.floor(stake * 1_000_000));
    // NOTE on post-condition mode: the deployed `flap.start-play` Clarity is
    // currently a stub that doesn't stx-transfer? the stake from tx-sender
    // — so `deny + willSendEq(stake)` would cause the wallet to refuse to
    // sign with a post-condition violation. Flip to `deny` + exact STX
    // post-condition the same day flap.clar starts escrowing the stake.
    await stx.call({
      contractAddress: FLAP_STX_DEPLOYER,
      contractName: FLAP_STX_CONTRACT,
      functionName: FLAP_STX_START_PLAY_FN,
      args: [{ type: "uint", value: stakeMicroStx }],
    });
  }

  const ctaCelo = mining
    ? phase === "approving"
      ? "Approving stake…"
      : "Opening play…"
    : needsApprove
      ? `Approve $${stake} cUSD`
      : `Stake $${stake} & fly →`;
  const ctaStacks = stx.pending
    ? "Sign on Stacks…"
    : stx.txid
      ? "Play opened ✓"
      : `Stake ${stake} STX & fly →`;
  const cta = kind === "celo" ? ctaCelo : ctaStacks;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div>
        <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">Per-play stake</div>
        <div className="flex flex-wrap gap-2">
          {STAKE_PRESETS.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={stake === s}
              onClick={() => setStake(s)}
              className={`px-3 py-1.5 min-h-[44px] rounded-full text-sm border transition-colors ${
                stake === s
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 text-slate-700 hover:border-slate-500"
              }`}
            >
              {kind === "celo" ? `$${s}` : `${s} STX`}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={start}
        disabled={!enabled}
        aria-busy={mining || isPending || stx.pending}
        className="w-full px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium disabled:opacity-40"
      >
        {cta}
      </button>

      {writeError && (
        <p className="text-xs text-red-600">{writeError.message.split("\n")[0]}</p>
      )}
      {stx.error && (
        <p className="text-xs text-red-600">{stx.error.split("\n")[0]}</p>
      )}

      {hash && (
        <div className="text-xs text-slate-500 flex items-center gap-3">
          <a
            href={`https://celoscan.io/tx/${hash}`}
            target="_blank"
            rel="noreferrer"
            className="text-action-orange underline hover:text-slate-900"
          >
            view tx ↗ ({hash.slice(0, 10)}…)
          </a>
          <button type="button" onClick={() => reset()} className="underline">
            reset
          </button>
        </div>
      )}
      {stx.txid && (
        <a
          href={`https://explorer.hiro.so/txid/${stx.txid}?chain=mainnet`}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-action-orange underline hover:text-slate-900"
        >
          view stacks tx ↗
        </a>
      )}
      {receipt && playId !== null && (
        <p className="text-xs text-emerald-600">
          Play opened — id <span className="font-mono font-semibold">#{playId.toString()}</span>.
          Paste this id into the Settle / Cancel panels below when you&apos;re done.
        </p>
      )}
      {receipt && playId === null && (
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
