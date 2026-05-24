"use client";

import { useMemo } from "react";

type Props = {
  value: string;
  size?: number;
  fg?: string;
  bg?: string;
  className?: string;
  alt?: string;
};

export function QrCode({
  value,
  size = 192,
  fg = "011821",
  bg = "ffffff",
  className = "",
  alt = "QR code",
}: Props) {
  const src = useMemo(() => {
    const url = new URL("https://api.qrserver.com/v1/create-qr-code/");
    url.searchParams.set("data", value);
    url.searchParams.set("size", `${size}x${size}`);
    url.searchParams.set("color", fg);
    url.searchParams.set("bgcolor", bg);
    url.searchParams.set("margin", "1");
    url.searchParams.set("format", "png");
    return url.toString();
  }, [value, size, fg, bg]);

  return <img src={src} width={size} height={size} loading="lazy" alt={alt} className={className} />;
}
