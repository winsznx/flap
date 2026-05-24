# Security

## Reporting

Private security advisory for anything that lets a player:

- Settle a play they didn't actually play
- Claim a bounty from a day they didn't stake in
- Mint a podium/streak badge they didn't earn
- Bypass the scorer signature requirement

## Out of scope

- Frontend XSS that needs attacker-injected JS first
- Forno RPC reachability
- Anything requiring owner/scorer keys to leak first

## Posture

`Flap.sol` uses OZ `ReentrancyGuard`, `Ownable`, `Pausable`. Scorer is rotatable. `cancelPlay` is the player's escape hatch when a score never lands.
