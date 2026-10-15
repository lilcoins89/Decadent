# Trust Wallet Agent Terminal 🛡️⚡

An autonomous, full-stack **Progressive Web App (PWA)** trading terminal and AI Agent powered by **Trust Wallet's Multichain Agent SDK**, **Jupiter DEX Aggregator**, **DexScreener Live Charts**, and **Recharts Visual Analytics**.

![Platform](https://img.shields.io/badge/Platform-Web%20PWA%20%2F%20Mobile%20%2F%20Desktop-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![React](https://img.shields.io/badge/React-19.0-61dafb)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.0-38bdf8)
![AI Model](https://img.shields.io/badge/AI%20Engine-Gemini%203.8%20Flash-orange)
![DEX Router](https://img.shields.io/badge/DEX-Jupiter%20Ultra%20%26%20Trust%20Wallet-emerald)
![Charts](https://img.shields.io/badge/Charts-DexScreener%20%2B%20Recharts-cyan)

---

## 🌟 Overview

The **Trust Wallet Agent Terminal** provides developers and traders with programmatic and conversational access to Trust Wallet's multichain infrastructure (Solana, BNB Smart Chain, Ethereum, Arbitrum, Polygon, and Base) and Jupiter's ultra-low latency swap routing.

The application combines a high-performance **Express + React 19** architecture with an autonomous Gemini 3.8 Flash AI Copilot capable of parsing natural language trade commands, arming Take Profit (TP) and Stop Loss (SL) guardians, rendering live DexScreener charts, and streaming interactive performance analytics.

---

## 🚀 Key Features

### 1. 🤖 Autonomous AI Trading Copilot
- **Natural Language Execution**: Say *"Buy 1.5 SOL of BONK"*, *"Set Take Profit at $185 and Stop Loss at $135 on SOL"*, or *"Chart $PEPE"* to trigger immediate agent action.
- **Function Calling & Tool Hybrid Engine**: Built with `@google/genai` calling structured tools:
  - `swap_tokens(fromToken, toToken, amount, chain)`
  - `set_take_profit_stop_loss(tokenSymbol, takeProfitPrice, stopLossPrice, amount)`
  - `view_dexscreener(symbolOrAddress, chain)`
  - `get_balance_and_portfolio(chain)`
  - `view_performance_analytics(timeframe)`
  - `execute_trustwallet_cli(command)`
- **Graceful Local Fallback**: Instant offline/heuristic NLP parser ensures zero disruption if network or quota limitations occur.

### 2. 📊 Live DexScreener Chart Terminal
- Embedded dark-theme live candlestick charts for any token or trading pair across Solana, BSC, Ethereum, and Arbitrum.
- **Pair Search Proxy** (`/api/dexscreener/search`): Query and load arbitrary tokens and DEX pairs without CORS restrictions.
- Real-time market metrics: USD price, 24h volume, liquidity depth, FDV, price change indicators, and contract security audit badges.

### 3. ⚡ Trade Execution & Multichain Routing
- **Jupiter Ultra on Solana**: Deep liquidity aggregation across Raydium CLMM, Orca Whirlpools, and Meteora DLMM with sub-0.05% price impact.
- **Trust Wallet Smart Router on EVM**: Optimal route discovery across PancakeSwap V3, Uniswap V3, and 1inch.
- Custom slippage tolerance settings (0.1%, 0.5%, 1.0%, custom) and transaction fee prioritization.

### 4. 🛡️ Autonomous Take Profit (TP) & Stop Loss (SL) Engine
- Bracket order configurator supporting customizable target gains (+15% to +200%) and stop loss limits (-5% to -30%).
- Autonomous price tick engine that continuously assesses market micro-volatility and triggers automated execution to secure gains or prevent capital drawdowns.
- Real-time guardian dashboard showing live trigger distance, progress meters, and historical execution logs.

### 5. 📈 Recharts Performance & Success Rate Analytics
- **Cumulative P&L Curve (`AreaChart`)**: Net profit progression and portfolio valuation over 24H, 7D, and 30D intervals.
- **Rolling Success Rate (`LineChart`)**: Trajectory tracking of trade win rate over time (78.4% benchmark).
- **Trade Volume Distribution (`BarChart`)**: Period-by-period winning trades vs. mitigated losing trades.
- **Trade-by-Trade Flow**: Granular individual execution cards with positive/negative profit bars.
- **Granular Interactive Tooltips**: Hover over any point to view exact **Entry Price**, **Exit Price**, **Profit/Loss per Trade**, **Position Size**, **Route**, and **UTC Timestamp**.
- **Interactive Trade Simulation**: One-click simulated trade execution to benchmark real-time Recharts reactivity.

### 6. 💻 Trust Wallet CLI & MCP Terminal
- In-browser interactive console executing `@trustwallet/cli` v1.4.2 commands via the Model Context Protocol (MCP) server bridge.
- Command history, autocompletion, and preset shortcuts:
  - `npx @trustwallet/cli balance`
  - `npx @trustwallet/cli swap SOL BONK 1.5`
  - `npx @trustwallet/cli keys list`
  - `npx @trustwallet/cli portal status`
  - `npx @trustwallet/cli --version`

### 7. 📱 Progressive Web App (PWA) Standard
- Full compliance with modern browser installability standards (`manifest.webmanifest`, `display: standalone`).
- In-app **Install PWA** prompt with automatic standalone detection and step-by-step iOS Safari installation modal.
- Offline state caching, connection status alerts, and pre-cached icon suite (`192x192`, `512x512`, `maskable`, `apple-touch-icon`).

### 8. 🔑 Developer Portal & Key Management
- HMAC-SHA256 authentication management for [portal.trustwallet.com](https://portal.trustwallet.com).
- Multichain deterministic keypair viewer (Solana `ed25519`, EVM `secp256k1`).
- Built-in developer test faucet providing simulated SOL, BONK, TWT, BNB, and USDC.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 19, TypeScript, Vite 8, Motion |
| **Styling & Design** | Tailwind CSS v4, Lucide Icons, Glassmorphic Terminal Theme |
| **PWA Infrastructure** | `vite-plugin-pwa`, Workbox Service Worker, Web App Manifest |
| **Charts & Visualizations** | Recharts v3 (Responsive Area, Line, Bar, Tooltips), DexScreener Embeds |
| **Backend & APIs** | Express 4 (Node.js/tsx), Google GenAI SDK (`@google/genai`) |
| **AI Model** | `gemini-3.8-flash` (Structured Tool Calling & System Instructions) |
| **DeFi Integrations** | Jupiter Swap API v6 (`jup-ag`), Trust Wallet Multichain Agent Skills (`tw-agent-skills`) |

---

## 📁 Repository Structure

```
├── .env.example                    # Documented environment variables template
├── .gitignore                      # Git exclusion rules
├── index.html                      # HTML entry with PWA headers and dark theme meta
├── metadata.json                   # Applet configuration & server capabilities
├── package.json                    # Project dependencies, devDependencies, and scripts
├── public/                         # PWA assets & iconography
│   ├── apple-touch-icon.png        # 180x180 iOS Touch Icon
│   ├── favicon.ico                 # 32x32 Favicon
│   ├── icon.svg                    # Vector brand shield
│   ├── pwa-192x192.png             # 192x192 PWA launcher icon
│   ├── pwa-512x512.png             # 512x512 High-res icon
│   └── pwa-maskable-512x512.png    # 512x512 Maskable squircle icon
├── raydium-quickstart/             # Raydium SDK V2 CPMM Swap Quickstart
│   ├── package.json                # Dependencies: @raydium-io/raydium-sdk-v2, @solana/web3.js, bn.js
│   ├── swap.mjs                    # Standalone CPMM Swap script (CurveCalculator, TxVersion.V0)
│   ├── test-swap.mjs               # Zero-config test runner with presets
│   └── README.md                   # Dedicated CPMM quickstart documentation
├── scripts/
│   └── generate-icons.js           # Programmatic PNG generator for PWA compliance
├── server.ts                       # Express backend: Gemini AI, Raydium & Jupiter Proxies, CLI Bridge
├── src/
│   ├── App.tsx                     # Main layout & responsive viewport routing
│   ├── index.css                   # Tailwind CSS global styles
│   ├── main.tsx                    # React DOM client entry
│   ├── components/                 # Modular UI components
│   │   ├── ActiveOrdersView.tsx    # TP/SL guardian dashboard & execution log
│   │   ├── AgentChatBox.tsx        # Conversational AI trading assistant
│   │   ├── AgentPerformanceView.tsx# Recharts PnL, win rate, and granular tooltips
│   │   ├── CLITerminal.tsx         # @trustwallet/cli interactive console
│   │   ├── DexScreenerView.tsx     # Embedded DexScreener charts & pair search
│   │   ├── Header.tsx              # Top navigation, chain switcher, and modals
│   │   ├── OfflineIndicator.tsx    # Network connectivity banner
│   │   ├── PortalModal.tsx         # portal.trustwallet.com API & HMAC config
│   │   ├── PWAInstallButton.tsx    # Install prompt with iOS guide modal
│   │   ├── RaydiumQuickstartView.tsx# Interactive Raydium SDK V2 CPMM runner & code inspector
│   │   ├── TradePanel.tsx          # Instant Swap, Raydium/Jupiter toggle, and Bracket TP/SL
│   │   └── WalletModal.tsx         # Multichain address manager & test faucet
│   ├── context/                    # React Context State Providers
│   │   ├── AgentContext.tsx        # Chat messages, tool execution, and view state
│   │   └── WalletContext.tsx       # Multichain balances, order tick engine, and swaps
│   ├── data/                       # Initial data & historical metrics
│   │   ├── agentPerformanceData.ts # 30D/7D/24H performance data points & trade logs
│   │   └── tokens.ts               # Multichain token registry (Solana, BSC, ETH, ARB)
│   ├── hooks/                      # Custom React hooks
│   │   ├── useOnlineStatus.ts      # Browser online/offline event listener
│   │   └── usePWAInstall.ts        # beforeinstallprompt & standalone detector
│   └── types/                      # Comprehensive TypeScript definitions
│       └── index.ts                # Token, Order, Trade, DexPair, Performance interfaces
├── tsconfig.json                   # TypeScript compiler options
└── vite.config.ts                  # Vite bundler & VitePWA plugin configuration
```

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **bun** package manager

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/trustwallet/tw-agent-skills.git
cd trust-wallet-agent-terminal
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your configuration:
```env
GEMINI_API_KEY="your-google-gemini-api-key"
PORT=3000
```
*(In Google AI Studio Build, `GEMINI_API_KEY` is injected automatically).*

### 3. Start the Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:3000`.

### 4. Build for Production
```bash
npm run build
npm start
```

### 5. Run Code Linter & Type Check
```bash
npm run lint
```

---

## ⚡ CLI Reference (`@trustwallet/cli`)

The integrated terminal supports all core subcommands of `@trustwallet/cli`:

```bash
# Check version and MCP server status
npx @trustwallet/cli --version

# Query multichain wallet balances across Solana, BSC, Ethereum, and Arbitrum
npx @trustwallet/cli balance

# Route an optimal multichain swap
npx @trustwallet/cli swap SOL BONK 1.5

# Inspect active wallet keypairs & HMAC encryption
npx @trustwallet/cli keys list

# Verify portal.trustwallet.com handshake
npx @trustwallet/cli portal status

# View all CLI commands and agent skills
npx @trustwallet/cli help
```

---

## 📚 Official Integration Resources

- **Trust Wallet Agent Skills**: [https://github.com/trustwallet/tw-agent-skills](https://github.com/trustwallet/tw-agent-skills)
- **Trust Wallet Charts**: [https://github.com/trustwallet/Charts](https://github.com/trustwallet/Charts)
- **Jupiter Quote API Node**: [https://github.com/jup-ag/jupiter-quote-api-node](https://github.com/jup-ag/jupiter-quote-api-node)
- **Jupiter Agent Skills**: [https://github.com/jup-ag/agent-skills](https://github.com/jup-ag/agent-skills)
- **Trust Wallet Developer Portal**: [https://portal.trustwallet.com](https://portal.trustwallet.com)

---

## ⚡ Raydium SDK V2 — CPMM Swap Quickstart

The terminal includes a self-contained, standalone implementation of **Raydium SDK V2 Constant Product Market Maker (CPMM)** swaps located in `/raydium-quickstart`.

### 1. Initialize & Install
```bash
mkdir raydium-quickstart && cd raydium-quickstart
npm init -y
npm install @raydium-io/raydium-sdk-v2 @solana/web3.js @solana/spl-token bn.js
```

### 2. Standalone `swap.mjs`
The script initializes `Raydium.load(...)`, queries CPMM pool info via `cpmm.getPoolInfoFromRpc(POOL_ID)`, calculates the constant-product curve quote using `CurveCalculator.swapBaseInput(...)`, and executes a Version 0 transaction (`TxVersion.V0`) with custom compute units (`units: 250_000`, `microLamports: 50_000`):

```bash
# Execute with Environment Variables
POOL_ID="7JuwScUQ8YMvsA9A3cv6W78d91gS17gV1xZJqB9vQpCP" \
INPUT_MINT="So11111111111111111111111111111111111111112" \
AMOUNT_RAW="100000000" \
node swap.mjs
```

### 3. Web UI & Terminal Integration
- **Interactive Runner View**: Navigate to the **Raydium SDK** tab in the top navigation bar to configure pool parameters, trigger real-time executions, inspect curve mathematics, and view Solscan transaction links.
- **TradePanel Integration**: Toggle between **Jupiter Ultra** and **Raydium CPMM SDK** directly inside the Instant Swap interface.
- **CLI Terminal**: Run `npx @trustwallet/cli raydium swap` or `node raydium-quickstart/swap.mjs` in the built-in terminal.
- **AI Agent Copilot**: Say *"Execute Raydium CPMM swap"* to invoke the autonomous `raydium_cpmm_swap` tool.

---

## 🛡️ Security & Architecture Best Practices

1. **Server-Side API Key Shielding**: All Gemini AI SDK calls and credential validations execute strictly on the server (`server.ts`). No API keys or private secrets are ever exposed to the client bundle.
2. **Deterministic Bracket Order Engine**: Order triggers evaluate price bounds every 4 seconds against simulated and live liquidity ticks, executing protected sales before adverse slippage occurs.
3. **PWA Offline Resilience**: Service worker precaches HTML, JS, CSS, and critical icon assets to ensure the wallet interface and cached order book remain accessible during network drops.

---

## 📄 License

Apache License 2.0. Built for developers integrating Trust Wallet & Jupiter multichain agent infrastructure.
