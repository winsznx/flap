"use client";

import { useEffect } from "react";
import { CopyButton } from "./CopyButton";
import { QrCode } from "./QrCode";
import { tweetLink, telegramLink, whatsAppLink, shareText } from "@/lib/share";

type Props = { open: boolean; onClose: () => void; url: string; score?: number };

export function MobileShareSheet({ open, onClose, url, score }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  const text = shareText(score);

  return (
    <div className="fixed inset-0 z-[85] flex items-end justify-center" role="dialog" aria-modal="true">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: "rgba(1,24,33,0.4)" }}
      />
      <div className="relative w-full max-w-md rounded-t-2xl border border-steel-gray bg-white p-5">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-steel-gray" />
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-xl border border-steel-gray bg-white p-3">
            <QrCode value={url} size={184} />
          </div>
          <div className="grid w-full grid-cols-3 gap-2">
            <a href={whatsAppLink(text, url)} target="_blank" rel="noreferrer" className="btn-secondary btn-compact text-center text-xs">
              WhatsApp
            </a>
            <a href={tweetLink(text, url)} target="_blank" rel="noreferrer" className="btn-secondary btn-compact text-center text-xs">
              X
            </a>
            <a href={telegramLink(text, url)} target="_blank" rel="noreferrer" className="btn-secondary btn-compact text-center text-xs">
              Telegram
            </a>
          </div>
          <div className="flex w-full items-center justify-between gap-2 rounded-lg border border-steel-gray bg-fog-gray px-3 py-2">
            <span className="truncate font-mono text-xs" style={{ color: "var(--color-slate-text)" }}>
              {url}
            </span>
            <CopyButton value={url} />
          </div>
        </div>
      </div>
    </div>
  );
}
