import { Tooltip } from "./Tooltip";

type Props = { children: React.ReactNode; help: React.ReactNode; className?: string };

export function HelpHint({ children, help, className = "" }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-widest ${className}`}
      style={{ color: "var(--color-slate-text)" }}
    >
      {children}
      <Tooltip content={help}>
        <span
          aria-hidden
          className="grid h-4 w-4 place-items-center rounded-full border border-steel-gray text-[10px]"
        >
          ?
        </span>
      </Tooltip>
    </span>
  );
}
