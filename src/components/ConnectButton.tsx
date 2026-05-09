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
        className="px-4 py-2 rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-sm text-slate-900 font-medium transition-colors"
        title="Disconnect"
      >
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-2 align-middle" />
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
        className="px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium disabled:opacity-50 transition-colors"
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
        className="px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-medium"
      >
        Pick wallet
      </button>
      <div className="absolute right-0 top-full mt-2 w-60 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-50 space-y-1">
        {connectors.length === 0 ? (
          <p className="text-xs text-slate-500 p-2">No wallet found.</p>
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
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-sm text-slate-900 disabled:opacity-50"
            >
              {c.name}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
