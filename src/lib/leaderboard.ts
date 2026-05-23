import type { Abi, AbiEvent, Address, Log } from "viem";
import { formatUnits } from "viem";

type GetLogsArgs = {
    address: Address;
    events: AbiEvent[];
    fromBlock: bigint;
    toBlock: bigint;
};

type MinimalClient = {
    getBlockNumber(): Promise<bigint>;
    getLogs(args: GetLogsArgs): Promise<Log[]>;
};

export type ActorEvent = { name: string; actorArg: string; valueArg?: string };
export type AggregateEntry = {
    address: Address;
    actions: number;
    valueWei: bigint;
    firstBlock: bigint;
    lastBlock: bigint;
    eventBreakdown: Record<string, number>;
};

const CHUNK_BLOCKS = 50_000n;

function pickEvents(abi: Abi, names: string[]): AbiEvent[] {
    return names.map((name) => abi.find(
        (i) => i.type === "event" && (i as AbiEvent).name === name,
    ) as AbiEvent | undefined).filter((x): x is AbiEvent => Boolean(x));
}

export async function fetchActorAggregates(opts: {
    client: MinimalClient;
    address: Address;
    abi: Abi;
    events: ActorEvent[];
    fromBlock?: bigint;
    lookbackBlocks?: bigint;
}): Promise<AggregateEntry[]> {
    const { client, address, abi, events } = opts;
    const head = await client.getBlockNumber();
    const lookback = opts.lookbackBlocks ?? 600_000n;
    const start = opts.fromBlock ?? (head > lookback ? head - lookback : 0n);
    const eventAbis = pickEvents(abi, events.map((e) => e.name));
    if (eventAbis.length === 0) return [];
    const nameToConfig = new Map(events.map((e) => [e.name, e]));
    const agg = new Map<string, AggregateEntry>();

    let cursor = start;
    while (cursor <= head) {
        const to = cursor + CHUNK_BLOCKS - 1n > head ? head : cursor + CHUNK_BLOCKS - 1n;
        let logs: Log[];
        try {
            logs = await client.getLogs({ address, events: eventAbis, fromBlock: cursor, toBlock: to });
        } catch {
            cursor = to + 1n;
            continue;
        }
        for (const log of logs) {
            const evName = (log as { eventName?: string }).eventName;
            if (!evName) continue;
            const cfg = nameToConfig.get(evName);
            if (!cfg) continue;
            const args = (log as { args?: Record<string, unknown> }).args ?? {};
            const rawActor = args[cfg.actorArg];
            if (typeof rawActor !== "string") continue;
            const actor = rawActor.toLowerCase() as Address;
            const blockNumber = log.blockNumber ?? 0n;
            let entry = agg.get(actor);
            if (!entry) {
                entry = { address: actor, actions: 0, valueWei: 0n, firstBlock: blockNumber, lastBlock: blockNumber, eventBreakdown: {} };
                agg.set(actor, entry);
            }
            entry.actions += 1;
            entry.eventBreakdown[evName] = (entry.eventBreakdown[evName] ?? 0) + 1;
            if (blockNumber > 0n) {
                if (blockNumber < entry.firstBlock || entry.firstBlock === 0n) entry.firstBlock = blockNumber;
                if (blockNumber > entry.lastBlock) entry.lastBlock = blockNumber;
            }
            if (cfg.valueArg) {
                const v = args[cfg.valueArg];
                if (typeof v === "bigint") entry.valueWei += v;
            }
        }
        cursor = to + 1n;
    }

    return Array.from(agg.values()).sort((a, b) => {
        if (b.actions !== a.actions) return b.actions - a.actions;
        if (b.valueWei !== a.valueWei) return b.valueWei > a.valueWei ? 1 : -1;
        return Number(a.firstBlock - b.firstBlock);
    });
}

export function formatCusd(wei: bigint): string {
    if (wei === 0n) return "—";
    const n = Number(formatUnits(wei, 18));
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k cUSD`;
    if (n >= 1) return `${n.toFixed(2)} cUSD`;
    if (n >= 0.01) return `${n.toFixed(3)} cUSD`;
    return `${n.toFixed(4)} cUSD`;
}

export function shortAddr(address: string): string {
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
