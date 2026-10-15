// Standalone test script with preset parameters
process.env.POOL_ID = process.env.POOL_ID || "7JuwScUQ8YMvsA9A3cv6W78d91gS17gV1xZJqB9vQpCP";
process.env.INPUT_MINT = process.env.INPUT_MINT || "So11111111111111111111111111111111111111112";
process.env.AMOUNT_RAW = process.env.AMOUNT_RAW || "100000000"; // 0.1 SOL

console.log("Running Raydium SDK V2 CPMM Swap Quickstart...");
import("./swap.mjs");
