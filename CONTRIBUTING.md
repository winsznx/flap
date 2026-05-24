# Contributing

## Setup

```bash
pnpm install
```

Foundry for `contracts/`.

## Branch + commits

- One concern per branch off `main`.
- Brief, specific commit messages. Lowercase prefix (`/play:`, `HopButton:`, `cusd:`).
- No co-authored-by, no backdating.

## Checks

```bash
pnpm lint
pnpm exec tsc --noEmit
forge test
```

## UI

- Use design tokens (`var(--color-*)`) not raw hex.
- Game canvas must not block render — keep heavy logic in `src/game/`.
- Mobile-first. Verify at 375px.
- Any cooldown UI: use `useNowSec`.

## Solidity

- Custom errors only.
- Reentrancy guard on every cUSD-touching path.
- Indexed `player` first on events.
