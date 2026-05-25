"use client";

import { useEffect, useState } from "react";
import { usePrevious } from "./usePrevious";

export function useFlash<T>(value: T, durationMs = 800): boolean {
  const [flashing, setFlashing] = useState(false);
  const prev = usePrevious(value);
  useEffect(() => {
    if (prev === undefined) return;
    if (prev === value) return;
    setFlashing(true);
    const id = window.setTimeout(() => setFlashing(false), durationMs);
    return () => window.clearTimeout(id);
  }, [prev, value, durationMs]);
  return flashing;
}
