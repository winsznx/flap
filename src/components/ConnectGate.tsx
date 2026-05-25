"use client";

import type { ReactNode } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "./ConnectButton";

type Props = { children: ReactNode; fallbackTitle?: string; fallbackBody?: string };

export function ConnectGate({
  children,
  fallbackTitle = "Connect to play for real",
  fallbackBody = "Plays settle on chain — Flap reads stakes + payouts straight from your wallet.",
}: Props) {
  const { isConnected } = useAccount();
  if (isConnected) return <>{children}</>;
  return (
    <div className="surface-elevated rounded-2xl p-6 text-center">
      <h3 className="text-lg font-semibold" style={{ color: "var(--color-ink-blue)" }}>
        {fallbackTitle}
      </h3>
      <p className="mt-2 text-sm" style={{ color: "var(--color-slate-text)" }}>
        {fallbackBody}
      </p>
      <div className="mt-4 inline-flex">
        <ConnectButton />
      </div>
    </div>
  );
}
