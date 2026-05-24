type Props = { size?: number; className?: string; ariaLabel?: string };

export function Spinner({ size = 14, className = "", ariaLabel = "Loading" }: Props) {
  return (
    <span
      role="status"
      aria-label={ariaLabel}
      aria-busy="true"
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
