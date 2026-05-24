"use client";

import { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

const trim = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [open, setOpen] = useState(false);

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
