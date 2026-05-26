"use client";

import { useState } from "react";
import { useStacksSession } from "./useStacksSession";

const FAUCET_CONTRACT =
  process.env.NEXT_PUBLIC_STACKS_FAUCET_CONTRACT ??
  "SP31DP8F8CF2GXSZBHHHK5J6Y061744E1TNFGYWYV.stx-faucet";

export function ClaimStxFaucetButton({ className = "" }: { className?: string }) {
  const { isConnected } = useStacksSession();
  const [opened, setOpened] = useState(false);

  function onClick() {
    if (!isConnected) return;
    const [contract, name] = FAUCET_CONTRACT.split(".");
    window.open(
      `https://explorer.hiro.so/txid/${contract}.${name}?chain=mainnet`,
      "_blank",
      "noopener,noreferrer",
    );
    setOpened(true);
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={onClick}
        disabled={!isConnected}
        className="rounded-full border border-current px-4 py-2 text-sm disabled:opacity-50"
      >
        {opened ? "Open in explorer ↗" : "Claim STX from faucet"}
      </button>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-widest opacity-60">
        opens the Hiro explorer to sign — sdk re-enables on paid worker plan
      </p>
    </div>
  );
}
