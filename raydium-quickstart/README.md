# Raydium SDK V2 CPMM Swap Quickstart

Direct Raydium CPMM swap implementation using `@raydium-io/raydium-sdk-v2`, `@solana/web3.js`, `@solana/spl-token`, and `bn.js`.

## Setup

```bash
cd raydium-quickstart
npm install --legacy-peer-deps
```

## Running a CPMM Swap

```bash
export RPC_URL="https://api.mainnet-beta.solana.com"
export KEYPAIR="$HOME/.config/solana/id.json"
export POOL_ID="7JuwScUQ8YMvsA9A3cv6W78d91gS17gV1xZJqB9vQpCP"   # Raydium CPMM Pool ID (Base58)
export INPUT_MINT="So11111111111111111111111111111111111111112" # Input token mint (Base58)
export AMOUNT_RAW="100000000"                                    # Raw integer lamports/units (e.g. 0.1 SOL)

node swap.mjs
```

## Features Demonstrated
1. **Raydium.load()**: Initializes the Raydium SDK V2 client with connection and Keypair.
2. **raydium.cpmm.getPoolInfoFromRpc()**: Loads live CPMM pool info, reserve balances, and fee configurations directly by base58 pool address.
3. **CurveCalculator.swapBaseInput()**: Computes deterministic constant product / CPMM curve output amounts and fee breakdown (`tradeFee`, `creatorFee`, `protocolFee`).
4. **raydium.cpmm.swap()**: Builds Versioned Transaction (TxVersion.V0) with ComputeBudget configuration (`250,000` units, `50,000` microLamports priority fee) and 0.5% slippage.
