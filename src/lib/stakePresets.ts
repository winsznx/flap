import { parseUnits } from "viem";

export const STAKE_PRESETS = [
  { label: "$0.05", valueWei: parseUnits("0.05", 18) },
  { label: "$0.10", valueWei: parseUnits("0.1", 18) },
  { label: "$0.25", valueWei: parseUnits("0.25", 18) },
  { label: "$0.50", valueWei: parseUnits("0.5", 18) },
] as const;
