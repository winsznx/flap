"use client";

import { useState } from "react";

type Props = {
  value: string;
  onChange: (next: string) => void;
  max?: string;
  suffix?: string;
  placeholder?: string;
  className?: string;
};

export function TokenAmountInput({
  value,
  onChange,
  max,
  suffix = "cUSD",
  placeholder = "0.00",
  className = "",
}: Props) {
  const [touched, setTouched] = useState(false);
  const isValid = value === "" || /^\d*\.?\d*$/.test(value);
  return (
    <div
      className={`flex items-center gap-2 rounded-xl border bg-white px-3 py-2 ${className}`}
      style={{
        borderColor: touched && !isValid ? "var(--color-action-orange)" : "var(--color-steel-gray)",
      }}
    >
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          if (!touched) setTouched(true);
        }}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-base tabular-nums outline-none"
        style={{ color: "var(--color-ink-blue)" }}
      />
      <span
        className="font-mono text-xs uppercase tracking-widest"
        style={{ color: "var(--color-slate-text)" }}
      >
        {suffix}
      </span>
      {max !== undefined && (
        <button
          type="button"
          onClick={() => onChange(max)}
          className="btn-secondary btn-compact text-[10px]"
        >
          MAX
        </button>
      )}
    </div>
  );
}
