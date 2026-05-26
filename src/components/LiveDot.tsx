type Props = { active?: boolean; className?: string; label?: string };

export function LiveDot({ active = true, className = "", label }: Props) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span
        aria-hidden
        className={`inline-block h-1.5 w-1.5 rounded-full ${active ? "animate-pulse" : ""}`}
        style={{ background: active ? "var(--color-success-moss)" : "var(--color-slate-text)" }}
      />
      {label && (
        <span
          className="font-mono text-[10px] uppercase tracking-widest"
          style={{ color: "var(--color-slate-text)" }}
        >
          {label}
        </span>
      )}
    </span>
  );
}
