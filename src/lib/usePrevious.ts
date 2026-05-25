"use client";

import { useEffect, useRef, useState } from "react";

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  const [prev, setPrev] = useState<T | undefined>(undefined);
  useEffect(() => {
    const t = window.setTimeout(() => {
      setPrev(ref.current);
      ref.current = value;
    }, 0);
    return () => window.clearTimeout(t);
  }, [value]);
  return prev;
}
