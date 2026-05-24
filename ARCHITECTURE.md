# Architecture

Flap is a stake-to-play arcade: the user approves cUSD, calls `startPlay` to lock a stake into the day's escrow, plays the canvas-based game locally, and the scorer key submits the score. Survives the threshold → keep the payout (2x stake on a winning play); fall short → stake goes to the day's bounty pool.

```
Browser (canvas game) ──> Cloudflare Worker (Next.js / OpenNext)
                                    │
                                    ▼
                            wagmi v3 + viem v2
                                    │
                                    ▼
                          forno.celo.org (reads)
                             Celo mainnet (42220)
                                    │
                                    ▼
                          Flap.sol
                             │       │       │
                             │       │       └── claim*Badge (NFT)
                             │       └────── submitScore (scorer-only)
                             └────────────── startPlay / settlePlay
                                    │
                                    ▼
                          cUSD ERC20 (Mento Dollar)
```

## Lifecycle

1. `approve(FLAP_ADDRESS, stake)` — once per allowance refresh
2. `startPlay(stake)` — debits cUSD, returns `playId`
3. Canvas game runs locally
4. `submitScore(playId, score)` — scorer key, off-chain side
5. `settlePlay(playId)` — anyone can call; payout / bounty split happens
6. `claimDailyBounty(day)` — anyone whose stake landed in the day's pool can claim a share

## Trust boundary

- `scorer` is the only key that can write scores. Rotatable.
- `treasury` collects unbeaten stakes. Rotatable.
- Players can `cancelPlay` before a score lands.

## Why two layers

The canvas runs locally so latency feels instant. The score is reported and settled on-chain so prizes are trustless. We deliberately don't push every move on-chain — that would be unplayable on Celo's block time.
