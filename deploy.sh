#!/usr/bin/env bash
# Flap — deploy to Celo mainnet.
#
# Reads /Users/mac/maypos/.env, broadcasts, verifies on Celoscan.

set -e
cd "$(dirname "$0")"

if [ -f "../.env" ]; then
  set -a
  # shellcheck disable=SC1091
  source ../.env
  set +a
else
  echo "missing /Users/mac/maypos/.env — copy .env.example to .env first" >&2
  exit 1
fi

[ -n "$PRIVATE_KEY" ]      || { echo "PRIVATE_KEY not set in ../.env"; exit 1; }
[ -n "$CUSD_ADDRESS" ]     || { echo "CUSD_ADDRESS not set"; exit 1; }
[ -n "$TREASURY_ADDRESS" ] || { echo "TREASURY_ADDRESS not set"; exit 1; }
[ -n "$CELOSCAN_API_KEY" ] || { echo "CELOSCAN_API_KEY not set"; exit 1; }

forge script script/Deploy.s.sol:Deploy \
  --rpc-url celo \
  --broadcast \
  --verify \
  --etherscan-api-key "$CELOSCAN_API_KEY"
