"use client";

import { useEffect, useState } from "react";

export function useIsClient(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(t);
  }, []);
  return mounted;
}
