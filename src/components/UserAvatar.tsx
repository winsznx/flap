import { shortAddr } from "@/lib/format";

type Props = { address: string; size?: number; className?: string };

/**
 * Deterministic identicon-ish chip. Hue derived from the address tail so
 * the same wallet looks the same across sessions without a heavy lib.
 */
export function UserAvatar({ address, size = 28, className = "" }: Props) {
  const hue = (parseInt(address.slice(-2), 16) * 37) % 360;
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-mono text-[10px] uppercase tracking-widest ${className}`}
      style={{
        width: size,
        height: size,
        background: `hsl(${hue}deg 36% 92%)`,
        color: `hsl(${hue}deg 64% 28%)`,
      }}
      title={address}
    >
      {shortAddr(address, 2, 0).replace("0x", "")}
    </span>
  );
}
