"use client";

import { useCallback, useLayoutEffect, useRef } from "react";

/**
 * Stable callback that always sees the latest props/state. Mostly used by
 * the game engine glue — the engine subscribes once but the React-side
 * handlers can update freely.
 */
export function useEventCallback<Args extends unknown[], R>(
  fn: (...args: Args) => R,
): (...args: Args) => R {
  const ref = useRef(fn);
  useLayoutEffect(() => {
    ref.current = fn;
  }, [fn]);
  return useCallback((...args: Args) => ref.current(...args), []);
}
