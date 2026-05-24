"use client";

import { useEffect, useState } from "react";

export function useNowSec(intervalMs = 60_000) {
  const [nowSec, setNowSec] = useState(0);
  useEffect(() => {
    const tick = () => setNowSec(Math.floor(Date.now() / 1000));
    const initial = window.setTimeout(tick, 0);
    const interval = window.setInterval(tick, intervalMs);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(interval);
    };
  }, [intervalMs]);
  return nowSec;
}
