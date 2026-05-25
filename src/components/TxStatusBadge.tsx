import { Pill } from "./Pill";

type Status = "idle" | "signing" | "pending" | "confirmed" | "failed";

const LABEL: Record<Status, string> = {
  idle: "Ready",
  signing: "Sign",
  pending: "Pending",
  confirmed: "Confirmed",
  failed: "Failed",
};

const TONE: Record<Status, "neutral" | "info" | "warn" | "win" | "lose"> = {
  idle: "neutral",
  signing: "info",
  pending: "warn",
  confirmed: "win",
  failed: "lose",
};

export function TxStatusBadge({ status }: { status: Status }) {
  return <Pill tone={TONE[status]}>{LABEL[status]}</Pill>;
}
