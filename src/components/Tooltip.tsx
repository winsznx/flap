"use client";

import { useState, type ReactNode } from "react";

type Props = { children: ReactNode; content: ReactNode; side?: "top" | "bottom" };

export function Tooltip({ children, content, side = "top" }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          className={`pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-steel-gray bg-white px-2 py-1 font-mono text-[10px] shadow-sm ${
            side === "top" ? "bottom-full mb-1" : "top-full mt-1"
          }`}
          style={{ color: "var(--color-slate-text)" }}
        >
          {content}
        </span>
      )}
    </span>
  );
}
