import type { ReactNode } from "react";

/**
 * Frosted overlay surface — used in game-over and bounty modals so the
 * canvas doesn't have to fade out completely behind them.
 */
export function GlassPanel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative rounded-2xl border border-steel-gray bg-white/70 p-5 backdrop-blur ${className}`}
    >
      {children}
    </div>
  );
}
