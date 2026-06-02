/**
 * Hiro mainnet explorer URL builders. Pair with celoscan helpers so chain-aware
 * components can resolve the right link without knowing the chain themselves.
 */
const BASE = "https://explorer.hiro.so";

export function hiroTxUrl(txid: string): string {
  return `${BASE}/txid/${txid}?chain=mainnet`;
}

export function hiroAddressUrl(address: string): string {
  return `${BASE}/address/${address}?chain=mainnet`;
}

export function hiroContractUrl(contractId: string): string {
  return `${BASE}/txid/${contractId}?chain=mainnet`;
}
