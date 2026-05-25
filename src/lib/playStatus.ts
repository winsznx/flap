export const PLAY_STATUS = ["Open", "Scored", "Settled", "Cancelled"] as const;
export type PlayStatus = (typeof PLAY_STATUS)[number];

export function playStatusLabel(status: number): PlayStatus {
  return PLAY_STATUS[status] ?? "Open";
}

export function playStatusTone(status: number): "info" | "warn" | "win" | "lose" {
  switch (status) {
    case 0:
      return "info";
    case 1:
      return "warn";
    case 2:
      return "win";
    case 3:
      return "lose";
    default:
      return "info";
  }
}
