"use client";

import { useEffect, useRef } from "react";

type Props = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-4" role="dialog" aria-modal="true">
      <button
        aria-label="Close"
        onClick={onCancel}
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: "rgba(1,24,33,0.4)" }}
      />
      <div ref={ref} className="relative w-full max-w-sm rounded-2xl border border-steel-gray bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold" style={{ color: "var(--color-ink-blue)" }}>
          {title}
        </h3>
        {description && (
          <p className="mt-2 text-sm" style={{ color: "var(--color-slate-text)" }}>
            {description}
          </p>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="btn-secondary btn-compact text-sm">
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} className="btn-primary btn-compact text-sm">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
