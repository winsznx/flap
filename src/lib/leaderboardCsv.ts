import type { ActorEvent } from "@/lib/leaderboard";

type LeaderboardRow = {
  address: string;
  actions: number;
  valueWei: bigint;
  lastBlock: bigint;
  eventBreakdown: Record<string, number>;
};

/**
 * CSV serialiser for the leaderboard export button. Strict-quotes any field
 * that contains a comma so spreadsheets parse cleanly.
 */
export function rowsToCsv(rows: LeaderboardRow[], events: ActorEvent[]): string {
  const eventNames = events.map((e) => e.name);
  const headers = ["rank", "address", "actions", "value_cusd", "last_block", ...eventNames];
  const escape = (raw: string) =>
    raw.includes(",") || raw.includes('"') ? `"${raw.replace(/"/g, '""')}"` : raw;
  const lines = [headers.join(",")];
  rows.forEach((r, idx) => {
    const value = Number(r.valueWei) / 1e18;
    const eventCounts = eventNames.map((n) => (r.eventBreakdown[n] ?? 0).toString());
    lines.push(
      [
        (idx + 1).toString(),
        escape(r.address),
        r.actions.toString(),
        value.toString(),
        r.lastBlock.toString(),
        ...eventCounts,
      ].join(","),
    );
  });
  return lines.join("\n");
}
