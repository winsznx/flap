"use client";

import { useChainKind } from "@/chain/ChainProvider";
import { CHAIN_KIND_LABEL, type ChainKind } from "@/chain/chainKinds";

const ORDER: ChainKind[] = ["celo", "stacks"];

export function NetworkSelector() {
  const { kind, setKind } = useChainKind();
  return (
    <div
      className="flex items-center rounded-full bg-[var(--color-fog-gray)] p-1"
      role="group"
      aria-label="Network selector"
    >
      {ORDER.map((k) => {
        const active = k === kind;
        return (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            className={[
              "nav-link",
              "min-w-[76px] justify-center",
              active ? "bg-white shadow-sm" : "bg-transparent",
            ].join(" ")}
            aria-pressed={active}
          >
            {CHAIN_KIND_LABEL[k]}
          </button>
        );
      })}
    </div>
  );
}

