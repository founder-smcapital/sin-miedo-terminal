# Institutional Market Data Platform & Synthetic Data Generator

An institutional-grade market data infrastructure providing rigorous stream validation, reconciliation, drift detection, backfill orchestration, and a **high-performance synthetic market data generator** for QA, quantitative backtesting, chaos engineering, and continuous integration (CI) regression suites.

---

## Table of Contents

1. [Synthetic Market Data Generator](#synthetic-market-data-generator)
   - [Core Capabilities](#core-capabilities)
   - [Financial Simulation Physics](#financial-simulation-physics)
   - [Chaos & Anomaly Injections](#chaos--anomaly-injections)
2. [CLI Usage Guide](#cli-usage-guide)
   - [Quick Start](#quick-start)
   - [Full CLI Options Reference](#full-cli-options-reference)
   - [Practical Examples](#practical-examples)
3. [Supported Output Formats](#supported-output-formats)
   - [JSONL (Newline-Delimited JSON)](#jsonl-newline-delimited-json)
   - [CSV (RFC 4180 Compliant)](#csv-rfc-4180-compliant)
4. [Programmatic TypeScript API](#programmatic-typescript-api)
5. [REST API Endpoints](#rest-api-endpoints)
6. [Testing & Quality Verification](#testing--quality-verification)
7. [CI / CD Pipeline Integration](#ci--cd-pipeline-integration)

---

## Synthetic Market Data Generator

The generator produces high-fidelity tick-by-tick feeds and OHLC bars across **Equities**, **FX**, **Crypto**, and **Commodities/Futures**. It bridges the gap between unit tests and live production trading by providing realistic stochastic pricing alongside targeted chaos and network anomalies.

### Core Capabilities

- **Tick-by-Tick Feeds**: Realistic bid/ask quotes, dynamic half-spreads, trade prints executed at bid, ask, or mid, and log-normal volume sizing.
- **OHLC Bar Aggregation**: Open, High, Low, Close, Volume, and VWAP constructed via intra-bar Brownian bridge walks. Guarantees mathematical invariants:
  $$\text{High} \ge \max(\text{Open}, \text{Close}, \text{Low})$$
  $$\text{Low} \le \min(\text{Open}, \text{Close}, \text{High})$$
  $$\text{VWAP} \in [\text{Low}, \text{High}], \quad \text{Volume} \ge 0$$
- **Multi-Asset Symbol Presets**: Pre-configured calibrated parameters for `SPY`, `AAPL`, `NVDA`, `MSFT`, `TSLA`, `EUR/USD`, `GBP/USD`, `USD/JPY`, `BTC/USD`, `ETH/USD`, `SOL/USD`, `ES_F`, `CL_F`, and `GC_F`.
- **Deterministic Seeding (`--seed <number>`)**: Uses Mulberry32 PRNG and Box-Muller Gaussian transforms to ensure 100% byte-for-byte reproducible datasets across test runs.
- **Timeframe Controls**: Granular intervals from high-frequency ticks to `1s`, `5s`, `1m`, `5m`, `15m`, `1h`, and `1d`.

### Financial Simulation Physics

Prices evolve under Geometric Brownian Motion (GBM) with asset-specific annualized drift ($\mu$) and volatility ($\sigma$):

$$S_{t+\Delta t} = S_t \exp\left( \left(\mu - \frac{1}{2}\sigma^2\right)\Delta t + \sigma \sqrt{\Delta t} Z \right)$$

where:
- $\Delta t = \frac{\text{intervalMs}}{\text{totalTradingMsPerYear}}$ (calibrated to 252 trading days for US equities, or 365.25 days for Crypto/FX).
- $Z \sim \mathcal{N}(0, 1)$ via Box-Muller transformation.
- Prices are quantized to exchange-mandated tick sizes (e.g., \$0.01 for Equities, 0.0001 for FX, \$0.50 for BTC, \$0.25 for CME ES futures).

### Chaos & Anomaly Injections

The generator can systematically introduce market irregularities to validate down-stream circuit breakers, deduplication engines, and backfill systems:

| Anomaly | Parameter | Description |
| :--- | :--- | :--- |
| **Randomized Gaps** | `--gaps <prob>` | Skips intervals/sequence numbers simulating network packet drops and venue outages. |
| **Price Spikes / Outliers** | `--outliers <prob>` | Injects extreme single-tick spikes or flash crashes (e.g., $\pm 25\%$) to test outlier filters. |
| **Delayed Messages** | `--delays <prob>` | Sets `ingestTs` significantly later than `ts` (high network latency skew). |
| **Duplicate Messages** | `--duplicates <prob>` | Re-emits frames with identical sequence IDs or timestamps to verify idempotency. |
| **Stale Price Streaks** | `--stale <prob>` | Freezes price flat with 0 volume across $N$ consecutive periods to simulate hung feeds. |
| **Crossed Markets** | `--crossed-market <prob>` | Inverts quote book such that $\text{Bid} > \text{Ask}$. |
| **Malformed Payloads** | `--malformed <prob>` | Injects corrupt payloads (negative prices, inverted OHLC) to verify quarantine gates. |
| **Chaos Preset Suite** | `--chaos` | Activates institutional stress testing with balanced distribution of all anomalies. |

---

## CLI Usage Guide

### Quick Start

Run directly using npm scripts or `tsx`:

```bash
# Generate 100 one-minute SPY bars to stdout in JSONL format
npm run generate:data -- --symbols SPY --count 100 --timeframe 1m

# Generate 500 tick-by-tick FX quotes for EUR/USD saved to CSV
npm run generate:data -- --mode ticks --symbols EUR/USD --count 500 --format csv --output fx_ticks.csv
```

### Full CLI Options Reference

```bash
npx tsx scripts/generate-market-data.ts [options]
```

```
CORE OPTIONS:
  --mode <ticks|bars|both>        Generation target (default: bars)
  --symbols, -s <SYM1,SYM2>       Comma-delimited tickers (e.g. AAPL,NVDA,SPY)
  --preset, -p <preset>           Symbol preset: 'equities', 'fx', 'crypto', 'futures', 'all'
  --count, -n <number>            Total ticks or bars to generate per symbol (default: 100)
  --timeframe, -t <tf>            Timeframe: 'tick', '1s', '5s', '1m', '5m', '15m', '1h', '1d' (default: 1m)
  --format, -f <jsonl|csv|json>   Serialization format (default: jsonl)
  --output, -o <file>             Write output to designated file (default: stdout)
  --seed <number>                 Deterministic PRNG seed for reproducible CI runs
  --start-price <number>          Override starting baseline price
  --volatility <number>           Annualized volatility sigma (e.g. 0.25 for 25%)
  --source <string>               Data vendor tag (default: 'SyntheticFeed')
  --venue <string>                Exchange / venue code (e.g. 'XNYS', 'XNAS', 'FX', 'CRYPTO')
  --start-time <ISO|ms>           Start UTC timestamp

CHAOS & REGRESSION STRESS INJECTION:
  --chaos                         Activates institutional stress suite (gaps, outliers, delays, dups, stale)
  --gaps <prob>                   Inject packet drop temporal gaps (0.0 - 1.0, e.g. 0.05)
  --outliers <prob>               Inject price spikes / flash crash outliers (0.0 - 1.0, e.g. 0.02)
  --outlier-multiplier <num>      Price spike multiplier (default: 1.25)
  --delays <prob>                 Inject high network latency skew (0.0 - 1.0, e.g. 0.05)
  --duplicates <prob>             Inject duplicate frames/sequences (0.0 - 1.0, e.g. 0.03)
  --stale <prob>                  Inject frozen price stale streaks (0.0 - 1.0, e.g. 0.02)
  --stale-streak <number>         Length of stale frozen streak (default: 5)
  --crossed-market <prob>         Inject crossed quotes (bid > ask) (default: 0.01)
  --malformed <prob>              Inject corrupt payloads (e.g. negative prices, inverted OHLC)

PIPELINE & OBSERVABILITY:
  --summary                       Print statistical summary & anomaly breakdown to stderr
  --validate                      Pass generated output through MarketDataValidationPipeline and report DLQ status
  --help, -h                      Display help guide
```

### Practical Examples

#### 1. Deterministic CI Regression Dataset
Generate a reproducible baseline for backtesting algorithms:
```bash
npm run generate:data -- --symbols AAPL --count 1000 --seed 42 --format jsonl --output test/fixtures/aapl_ci_baseline.jsonl
```

#### 2. Full Chaos Stress Test with Real-Time Pipeline Audit
Generate 1,000 equity bars, inject network chaos, and run through the validation layer:
```bash
npm run generate:data -- --preset equities --count 1000 --chaos --validate --summary
```

*Example Audit Output:*
```
--- PIPELINE VALIDATION AUDIT REPORT ---
Total Evaluated: 948
Passed (Clean):  822 (86.7%)
Warnings:        48
Dropped / DLQ:   78 (8.2%)
----------------------------------------

--- SYNTHETIC GENERATION SUMMARY ---
Mode:              bars
Symbols:           SPY, AAPL, NVDA, MSFT, TSLA
Timeframe:         1m
Total Generated:   948
Generation Time:   14ms
Seed:              RANDOM
Anomaly Injections:
  - GAP: 52
  - OUTLIER_SPIKE: 19
  - DUPLICATE_MESSAGE: 28
  - STALE_PRICE: 18
  - MALFORMED_PAYLOAD: 10
Price Ranges:
  - SPY: Start=582.5, Min=448.52, Max=757.25, End=583.12
------------------------------------
```

#### 3. Crypto Jump-Diffusion OHLC Dataset
```bash
npm run generate:data -- --symbols BTC/USD --timeframe 5m --count 500 --volatility 0.65 --format csv --output btc_5m.csv
```

---

## Supported Output Formats

### JSONL (Newline-Delimited JSON)
Standard format for streaming analytics, log forwarders (Fluentd, Vector), and cloud pipelines. Each line contains a self-contained JSON object:

```json
{"symbol":"SPY","timestamp":1792064216533,"open":582.50,"high":582.72,"low":582.35,"close":582.60,"volume":1250,"vwap":582.54,"source":"SyntheticFeed","tickCount":12,"sequenceStart":1000,"sequenceEnd":1012,"injectedAnomaly":"NONE"}
```

### CSV (RFC 4180 Compliant)
Optimized for direct ingestion into Python / Pandas, DuckDB, Polars, R, or Excel:

```csv
symbol,timestamp_utc_ms,iso_time,price,bid,ask,spread_bps,volume,sequence_id,venue,source,ingest_timestamp_utc_ms,injected_anomaly,is_duplicate
EUR/USD,1792064219697,2026-10-15T11:36:59.697Z,1.0851,1.0851,1.0852,0.92,1418854,1,FX,SyntheticFeed,1792064219711,NONE,false
```

---

## Programmatic TypeScript API

You can import and instantiate the generator directly in your services or test suites:

```typescript
import {
  SyntheticMarketDataGenerator,
  GeneratorConfig
} from "./src/generator";

const generator = new SyntheticMarketDataGenerator(42); // Seeded for reproducibility

const config: GeneratorConfig = {
  mode: "bars",
  symbols: ["SPY", "NVDA"],
  count: 500,
  timeframe: "1m",
  chaos: {
    gapProbability: 0.05,
    outlierProbability: 0.02
  }
};

const { bars, ticks, summary } = generator.generate(config);
console.log(`Generated ${bars.length} bars. Spikes: ${summary.anomalyCounts.OUTLIER_SPIKE}`);
```

---

## REST API Endpoints

The system exposes HTTP endpoints for runtime integration and interactive testing:

### `POST /api/v1/generator/generate`
Generate synthetic ticks or bars dynamically via JSON payload:
```bash
curl -X POST http://localhost:3000/api/v1/generator/generate \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "bars",
    "symbols": ["AAPL", "BTC/USD"],
    "count": 50,
    "timeframe": "1m",
    "seed": 42
  }'
```

### `GET /api/v1/generator/presets`
Retrieves pre-calibrated symbol parameters and asset class groups.

---

## Testing & Quality Verification

All 66 tests verify financial invariants, reproducibility, chaos detection, and pipeline integration under Jest:

```bash
# Run entire test suite
npm test

# Run generator test suite specifically
npx jest test/generator/syntheticGenerator.test.ts
```

---

## CI / CD Pipeline Integration

Add this snippet to your `.github/workflows/ci.yml` or continuous integration runner to guarantee that every PR validates deterministic data generation and regression resilience:

```yaml
name: Market Data Quality & Pipeline CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  validate-market-pipeline:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: TypeScript Lint & Typecheck
        run: npm run lint

      - name: Run Institutional Test Suite
        run: npm test

      - name: Generate Deterministic CI Regression Dataset
        run: |
          npm run generate:data -- --preset equities --count 500 --seed 42 --format jsonl -o dist/ci_equities_baseline.jsonl
          npm run generate:data -- --preset fx --mode ticks --count 500 --seed 42 --format csv -o dist/ci_fx_ticks.csv

      - name: Stress Test Pipeline with Chaos Injection
        run: |
          npm run generate:data -- --preset all --count 1000 --chaos --validate --summary

---

## Authentication & Server Secrets

- Firebase sign-in alone does not grant terminal access. Provision users through a trusted Firebase Admin process with custom claims `terminalAccess: true` and a supported `tier`: `Founding Member`, `Professional Allocator`, `Institutional Desk`, `Institutional Alpha`, `Sovereign Advisory`, or `Sovereign Desk`. The optional `role` claim is one of `admin`, `analyst`, `partner`, or `founding_member`.
- Firestore profile fields are not authorization data. The `admin: true` custom claim is required for profile administration; users may only update their own safe preference fields. Notes and alerts remain owner-scoped.
- Keep provider credentials server-side in deployment secrets. `FINNHUB_API_KEY` has no built-in fallback. Polygon key administration requires a Firebase token carrying the `admin: true` custom claim; on Vercel, configure provider credentials as deployment secrets instead of runtime key changes.
- In production, set a strong `INTERNAL_SERVICE_TOKEN` on both the Node service and Python backend. The Python API rejects internal requests if production authentication is enabled but that token is missing.
- Configure `FIREBASE_SERVICE_ACCOUNT_JSON` on Vercel (or `GOOGLE_APPLICATION_CREDENTIALS` for local Node development) so the API can verify Firebase ID tokens. Never place service-account credentials in the client bundle or source control.
- All API mutations, intelligence routes, `/api/orderflow/*`, the debt-buyback strategy read, and `/api/v1/*` routes except `/api/v1/health` require a valid Firebase ID token with `terminalAccess: true` and a supported `tier`. Basic market-data GETs and health checks remain public. Browser API requests attach the current Firebase token automatically.
- Vercel deployments use HTTP polling for streaming data because serverless instances do not share the Express process's in-memory SSE broadcast state. Persistent hosts retain SSE behavior.
- Accounts without the required Firebase claims are denied terminal access until provisioned. No client-side tier or passcode can grant access.

## Frontend Market-Data Provenance

- Initial values are labeled illustrative until an API response is received. A successful API response does not by itself certify a provider observation timestamp or exchange entitlement.
- VIX snapshots are sourced from Yahoo Finance and may be delayed; the UI does not describe them as a direct CBOE feed. Chart history is labeled illustrative unless actual VIX observations are present; realized-volatility and VVIX overlays remain modeled.
- DXY is an indicative quote or partial USD-basket proxy. Intraday history and cross-asset scenario curves are illustrative, and fixed correlation values are not calculated from live returns.
- Gold history, volume, GPR points, and annotations are illustrative. The latest gold macro quote uses a PAXG/USD proxy and is not a physical bullion-market quote.
- Order-book and tape surfaces distinguish provider snapshots from simulated levels/prints. Equity depth extensions and all generated footprint clusters are modeled; trade size tiers do not identify institutional participants.

## Full-Stack Deployment: Vercel & Container Platforms

The platform is engineered with a **Dual-Mode Full-Stack Architecture**:

1. **Vercel Serverless Full-Stack**:
   - **Frontend**: Vite SPA built into `/dist` and served across Vercel's global Edge CDN.
   - **Backend API**: All 50+ institutional endpoints (`/api/futures`, `/api/macro/*`, `/api/orderflow/*`, `/api/polygon/*`, `/api/v1/*`) are routed to the Serverless Function at `/api/index.ts`, executing the Express backend on-demand with sub-50ms cold starts.
   - **Deploy on Vercel**:
     1. Import this GitHub repository into your Vercel Dashboard.
     2. Framework Preset: **Vite** (explicitly selected in `vercel.json`).
     3. Install Command: `npm ci` (explicitly selected in `vercel.json`; prevents Vercel from treating the separate Python backend requirements as the frontend runtime).
     4. Build Command: `npm run build` (configured in `vercel.json`).
     5. Output Directory: `dist` (configured in `vercel.json`).
     6. Environment Variables:
        - `POLYGON_API_KEY` (SIP consolidated tape & energy parity)
        - `POLYGON_ACCESS_KEY_ID` (Institutional account reference)
        - `OPENMARKET_API_KEY` (OpenMarket consensus verification)
        - `FINNHUB_API_KEY` (Global equities & energy proxies)
        - `FIREBASE_SERVICE_ACCOUNT_JSON` (Server-only Firebase Admin credential for API token verification)
        - `FIREBASE_PROJECT_ID` (Optional; defaults to the project's Firebase config)
        - `INTERNAL_SERVICE_TOKEN` (Strong shared secret when routing to the Python backend)
        - `PYTHON_BACKEND_URL` (Optional: if routing SEC/FRED to external Render/Railway service)
     7. Click **Deploy**. The Vite client and TypeScript serverless API deploy together. The Python backend is a separate service.

2. **Persistent Container Hosting (Docker / Railway / Render / Google Cloud Run / VPS)**:
   - For long-lived persistent streaming connections (continuous SSE push streams & background schedulers):
     ```bash
     npm run build
     npm start
     ```
   - Automatically binds to `http://0.0.0.0:$PORT` (default: `3000`) and serves both the compiled Vite SPA and persistent WebSocket/SSE real-time streams.
