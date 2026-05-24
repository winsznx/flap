import { formatUnits, parseUnits } from "viem";

const DECIMALS = 18;

export function formatCusd(wei: bigint, maxDecimals = 4): string {
  const n = Number(formatUnits(wei, DECIMALS));
  if (!Number.isFinite(n)) return "0";
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  });
}

export function parseCusd(input: string): bigint {
  const trimmed = input.replace(/[\s,]/g, "");
  if (!trimmed || trimmed === "." || trimmed === "-") return 0n;
  try {
    return parseUnits(trimmed, DECIMALS);
  } catch {
    return 0n;
  }
}
