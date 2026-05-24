const HOSTS: Record<number, string> = {
  42220: "https://celoscan.io",
  44787: "https://alfajores.celoscan.io",
};
const base = (chainId = 42220) => HOSTS[chainId] ?? HOSTS[42220]!;

export const txUrl = (hash: string, chainId?: number) => `${base(chainId)}/tx/${hash}`;
export const addressUrl = (address: string, chainId?: number) =>
  `${base(chainId)}/address/${address}`;
export const blockUrl = (block: number | bigint, chainId?: number) =>
  `${base(chainId)}/block/${block.toString()}`;
