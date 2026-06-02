"use client";

/**
 * Renders when a feature only ships on the Celo deployment of a contract.
 * Use as an early return inside chain-aware panels so Stacks users see a
 * clear "switch to Celo" affordance instead of a silently disabled button
 * that secretly fires a Celo write.
 */
export function CeloOnlyNotice({ feature }: { feature: string }) {
  return (
    <div
      className="rounded-lg px-4 py-3 text-xs"
      style={{
        background: "var(--color-fog-gray)",
        color: "var(--color-slate-text)",
        border: "1px solid var(--color-steel-gray)",
      }}
    >
      {feature} ships on Celo only — switch the chain toggle to Celo to use it.
    </div>
  );
}
