/**
 * Stacks-side leaderboard aggregator. Reads per-contract tx lists from the
 * Hiro v1 address API + tallies sender addresses across all related
 * contracts in this product so the UI can render the same shape as the
 * Celo aggregator.
 */
const HIRO_MAINNET = "https://api.hiro.so";

export type StacksAggregateEntry = {
  address: string;
  actions: number;
  microStxMoved: bigint;
  firstBlock: number;
  lastBlock: number;
  eventBreakdown: Record<string, number>;
};

type HiroTx = {
  tx_id: string;
  tx_status: string;
  tx_type: string;
  sender_address: string;
  block_height?: number;
  contract_call?: {
    contract_id?: string;
    function_name?: string;
  };
  fee_rate?: string;
};

type HiroListResponse = {
  results?: HiroTx[];
  total?: number;
};

async function fetchContractTxs(contractId: string, limit = 50): Promise<HiroTx[]> {
  // /extended/v1/address/{principal}.{name}/transactions returns the union of
  // txs touching this address — for a contract that's every call into it.
  const url = `${HIRO_MAINNET}/extended/v1/address/${contractId}/transactions?limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`hiro tx list ${res.status} for ${contractId}`);
  const json = (await res.json()) as HiroListResponse;
  return (json.results ?? []).filter(
    (t) => t.tx_status === "success" && t.tx_type === "contract_call",
  );
}

export async function fetchStacksAggregates(opts: {
  contractIds: string[];
  perContractLimit?: number;
}): Promise<StacksAggregateEntry[]> {
  const { contractIds, perContractLimit = 50 } = opts;
  const all = await Promise.all(
    contractIds.map((id) => fetchContractTxs(id, perContractLimit).catch(() => [])),
  );

  const acc = new Map<string, StacksAggregateEntry>();
  for (const txs of all) {
    for (const tx of txs) {
      const sender = tx.sender_address;
      const fn = tx.contract_call?.function_name ?? "unknown";
      const block = tx.block_height ?? 0;
      let row = acc.get(sender);
      if (!row) {
        row = {
          address: sender,
          actions: 0,
          microStxMoved: 0n,
          firstBlock: block,
          lastBlock: block,
          eventBreakdown: {},
        };
        acc.set(sender, row);
      }
      row.actions += 1;
      row.eventBreakdown[fn] = (row.eventBreakdown[fn] ?? 0) + 1;
      if (block < row.firstBlock) row.firstBlock = block;
      if (block > row.lastBlock) row.lastBlock = block;
      if (tx.fee_rate) {
        try {
          row.microStxMoved += BigInt(tx.fee_rate);
        } catch {
          /* ignore */
        }
      }
    }
  }

  return [...acc.values()].sort((a, b) => b.actions - a.actions);
}

export function shortStxAddress(addr: string, head = 6, tail = 4): string {
  if (!addr || addr.length < head + tail + 1) return addr;
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}
