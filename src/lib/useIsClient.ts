"use client";

import { useEffect, useState } from "react";

export function useIsClient(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
