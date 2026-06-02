"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useChainKind } from "@/chain/ChainProvider";
import {
  connectStacks,
  disconnectStacks,
  isStacksWalletAvailable,
  readStacksSession,
} from "@/chain/stacksSession";

const trim = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

export function ConnectButton() {
  const { kind } = useChainKind();
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [open, setOpen] = useState(false);
  const [stxAddr, setStxAddr] = useState<string | null>(null);
  const [stxAvail, setStxAvail] = useState<boolean | null>(null);
  const [stxBusy, setStxBusy] = useState(false);
  const [stxInstallOpen, setStxInstallOpen] = useState(false);

  useEffect(() => {
    if (kind !== "stacks") return;
    setStxAddr(readStacksSession().address);
    isStacksWalletAvailable().then(setStxAvail);
  }, [kind]);

  const isStacksConnected = useMemo(() => kind === "stacks" && !!stxAddr, [kind, stxAddr]);

  if (kind === "stacks") {
    if (isStacksConnected && stxAddr) {
      return (
        <button
          type="button"
          onClick={async () => {
            await disconnectStacks();
            setStxAddr(null);
          }}
          className="btn-secondary btn-compact"
          title="Disconnect"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-[var(--color-success-moss)]" />
          {trim(stxAddr)}
        </button>
      );
    }

    if (stxAvail === false) {
      return (
        <div className="relative">
          <button
            type="button"
            className="btn-primary btn-compact"
            onClick={() => setStxInstallOpen((v) => !v)}
          >
            Install Stacks wallet
          </button>
          {stxInstallOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-72 space-y-2 rounded-xl border border-[var(--color-steel-gray)] bg-white p-3 text-sm shadow-xl">
              <p className="text-xs text-[var(--color-slate-text)]">
                Flap needs Leather or Xverse to sign Stacks transactions.
              </p>
              <a
                href="https://leather.io/install-extension"
                target="_blank"
                rel="noreferrer"
                className="block rounded-lg border border-[var(--color-steel-gray)] bg-[var(--color-fog-gray)] px-3 py-2 text-[var(--color-ink-blue)]"
              >
                Install Leather ↗
              </a>
              <a
                href="https://www.xverse.app/download"
                target="_blank"
                rel="noreferrer"
                className="block rounded-lg border border-[var(--color-steel-gray)] bg-[var(--color-fog-gray)] px-3 py-2 text-[var(--color-ink-blue)]"
              >
                Install Xverse ↗
              </a>
              <button
                type="button"
                onClick={async () => {
                  const next = await isStacksWalletAvailable();
                  setStxAvail(next);
                  if (next) setStxInstallOpen(false);
                }}
                className="block w-full rounded-lg border border-[var(--color-steel-gray)] bg-white px-3 py-2 text-xs text-[var(--color-slate-text)]"
              >
                I just installed one — retry
              </button>
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        type="button"
        disabled={isPending || stxBusy}
        className="btn-primary btn-compact disabled:opacity-50"
        onClick={async () => {
          setStxBusy(true);
          try {
            const s = await connectStacks();
            setStxAddr(s.address);
          } finally {
            setStxBusy(false);
          }
        }}
      >
        {stxBusy ? "Opening wallet…" : "Connect Stacks"}
      </button>
    );
  }

  if (isConnected && address) {
    return (
      <button
        type="button"
        onClick={() => disconnect()}
        className="btn-secondary btn-compact"
        title="Disconnect"
      >
        <span className="inline-block h-2 w-2 rounded-full bg-[var(--color-success-moss)]" />
        {trim(address)}
      </button>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={isPending}
        className="btn-primary btn-compact disabled:opacity-50"
      >
        Connect wallet
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="btn-primary btn-compact"
      >
        Pick wallet
      </button>
      <div className="absolute right-0 top-full z-50 mt-2 w-60 space-y-1 rounded-xl border border-[var(--color-steel-gray)] bg-white p-2 shadow-xl">
        {connectors.length === 0 ? (
          <p className="p-2 text-xs text-[var(--color-slate-text)]">No wallet found.</p>
        ) : (
          connectors.map((c) => (
            <button
              key={c.uid}
              type="button"
              onClick={() => {
                connect({ connector: c });
                setOpen(false);
              }}
              disabled={isPending}
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-[var(--color-ink-blue)] hover:bg-[var(--color-fog-gray)] disabled:opacity-50"
            >
              {c.name}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
