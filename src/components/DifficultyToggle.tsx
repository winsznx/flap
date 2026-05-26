"use client";

import { useState } from "react";

type Difficulty = "chill" | "normal" | "beast";

const OPTIONS: { id: Difficulty; label: string; hint: string }[] = [
  { id: "chill", label: "Chill", hint: "Slow obstacles" },
  { id: "normal", label: "Normal", hint: "Stake-ready" },
  { id: "beast", label: "Beast", hint: "Bigger payouts" },
];

type Props = { value?: Difficulty; onChange?: (next: Difficulty) => void; className?: string };

export function DifficultyToggle({ value, onChange, className = "" }: Props) {
  const [local, setLocal] = useState<Difficulty>(value ?? "normal");
  const active = value ?? local;
  return (
    <div role="radiogroup" className={`grid grid-cols-3 gap-2 ${className}`}>
      {OPTIONS.map((o) => {
        const selected = o.id === active;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => {
              setLocal(o.id);
              onChange?.(o.id);
            }}
            className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
              selected ? "btn-primary" : "btn-secondary"
            }`}
          >
            <div className="font-semibold">{o.label}</div>
            <div className="mt-0.5 font-mono text-[10px] uppercase tracking-widest opacity-70">
              {o.hint}
            </div>
          </button>
        );
      })}
    </div>
  );
}
