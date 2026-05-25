export type ChainKind = "celo" | "stacks";

export const CHAIN_KIND_LABEL: Record<ChainKind, string> = {
  celo: "Celo",
  stacks: "Stacks",
};

export function parseChainKind(value: unknown): ChainKind | null {
  if (value === "celo" || value === "stacks") return value;
  return null;
}

