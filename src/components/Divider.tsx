export function Divider({ label, className = "" }: { label?: string; className?: string }) {
  if (!label) {
    return <hr className={`border-t border-steel-gray ${className}`} />;
  }
  return (
    <div
      className={`flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest ${className}`}
      style={{ color: "var(--color-slate-text)" }}
    >
      <span className="flex-1 border-t border-steel-gray" />
      <span>{label}</span>
      <span className="flex-1 border-t border-steel-gray" />
    </div>
  );
}
