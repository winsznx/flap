import { formatUnits } from "viem";

const ONE = 10000n;

export function treasuryCutWei(poolWei: bigint, bps: number): bigint {
  return (poolWei * BigInt(bps)) / ONE;
}

export function winnerTakeWei(poolWei: bigint, bps: number): bigint {
  return poolWei - treasuryCutWei(poolWei, bps);
}

export function formatPct(bps: number): string {
  return `${(bps / 100).toFixed(2)}%`;
}

export function previewSplit(poolWei: bigint, bps: number) {
  return {
    pool: formatUnits(poolWei, 18),
    treasury: formatUnits(treasuryCutWei(poolWei, bps), 18),
    winner: formatUnits(winnerTakeWei(poolWei, bps), 18),
    bpsLabel: formatPct(bps),
  };
}
