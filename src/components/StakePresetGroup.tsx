"use client";

import { useState } from "react";
import { STAKE_PRESETS } from "@/lib/stakePresets";

type Props = { onPick: (valueWei: bigint) => void; defaultIndex?: number; className?: string };

export function StakePresetGroup({ onPick, defaultIndex = 1, className = "" }: Props) {
  const [active, setActive] = useState(defaultIndex);
  return (
    <div role="radiogroup" className={`flex gap-2 ${className}`}>
      {STAKE_PRESETS.map((p, i) => {
        const selected = i === active;
        return (
          <button
            key={p.label}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => {
              setActive(i);
              onPick(p.valueWei);
            }}
            className={`flex-1 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
              selected ? "btn-primary" : "btn-secondary"
            }`}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
