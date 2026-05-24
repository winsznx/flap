"use client";

import { useClipboard } from "@/lib/useClipboard";

type Props = { value: string; label?: string; copiedLabel?: string; className?: string };

export function CopyButton({ value, label = "Copy", copiedLabel = "Copied", className = "" }: Props) {
  const { copied, copy } = useClipboard();
  return (
    <button
      type="button"
      onClick={() => copy(value)}
      aria-live="polite"
      className={`btn-secondary btn-compact text-xs ${className}`}
    >
      {copied ? copiedLabel : label}
    </button>
  );
}
