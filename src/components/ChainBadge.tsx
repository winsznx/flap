const LABELS: Record<number, { name: string; tone: string }> = {
  42220: { name: "Celo mainnet", tone: "var(--color-success-moss)" },
  44787: { name: "Alfajores", tone: "var(--color-action-orange)" },
};

export function ChainBadge({ chainId, className = "" }: { chainId: number; className?: string }) {
  const info = LABELS[chainId] ?? { name: `Chain ${chainId}`, tone: "var(--color-slate-text)" };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-steel-gray bg-white px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest ${className}`}
      style={{ color: "var(--color-slate-text)" }}
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: info.tone }} />
      {info.name}
    </span>
  );
}
