import type { ReactNode } from "react";

export function KbdKey({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={`inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded border border-steel-gray bg-white px-1 font-mono text-[11px] shadow-[0_1px_0_var(--color-steel-gray)] ${className}`}
      style={{ color: "var(--color-slate-text)" }}
    >
      {children}
    </kbd>
  );
}
