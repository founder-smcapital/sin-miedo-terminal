#!/usr/bin/env tsx
/**
 * Institutional Synthetic Market Data CLI & Generator Script
 * 
 * Generates synthetic tick-by-tick feeds and OHLC bars across Equities, FX, Crypto, and Commodities.
 * Supports stochastic diffusion (GBM), microstructure, chaos injection (gaps, outliers, delays, duplicates, stale streaks),
 * deterministic seeding for CI/backtesting, and JSONL / CSV exports.
 * 
 * Usage:
 *   npx tsx scripts/generate-market-data.ts [options]
 *   npm run generate:data -- [options]
 */

import * as fs from "fs";
import * as path from "path";
import {
  SyntheticMarketDataGenerator,
  GeneratorConfig,
  MarketTimeframe,
  PRESET_GROUPS,
  PRESET_SYMBOLS
} from "../src/generator";
import { MarketDataValidationPipeline } from "../src/validation";

interface CliParsedArgs {
  mode: "ticks" | "bars" | "both";
  symbols: string[];
  preset?: string;
  count: number;
  timeframe: MarketTimeframe;
  format: "jsonl" | "csv" | "json";
  output?: string;
  seed?: number;
  startPrice?: number;
  volatility?: number;
  source?: string;
  venue?: string;
  startTime?: number;
  // Chaos flags
  chaosPreset: boolean;
  gapProb?: number;
  outlierProb?: number;
  outlierMultiplier?: number;
  delayProb?: number;
  delayMinMs?: number;
  delayMaxMs?: number;
  duplicateProb?: number;
  staleProb?: number;
  staleStreak?: number;
  crossedMarketProb?: number;
  malformedProb?: number;
  // Execution flags
  summary: boolean;
  validate: boolean;
  help: boolean;
}

function parseCliArgs(argv: string[]): CliParsedArgs {
  const args: CliParsedArgs = {
    mode: "bars",
    symbols: ["SPY"],
    count: 100,
    timeframe: "1m",
    format: "jsonl",
    chaosPreset: false,
    summary: false,
    validate: false,
    help: false
  };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === "--help" || arg === "-h") {
      args.help = true;
    } else if (arg === "--mode") {
      const val = argv[++i];
      if (val === "ticks" || val === "bars" || val === "both") {
        args.mode = val;
      }
    } else if (arg === "--symbols" || arg === "-s") {
      const val = argv[++i];
      args.symbols = val.split(",").map(s => s.trim().toUpperCase());
    } else if (arg === "--preset" || arg === "-p") {
      const val = argv[++i]?.toLowerCase();
      args.preset = val;
      if (PRESET_GROUPS[val]) {
        args.symbols = [...PRESET_GROUPS[val]];
      }
    } else if (arg === "--count" || arg === "-n") {
      args.count = parseInt(argv[++i], 10) || 100;
    } else if (arg === "--timeframe" || arg === "-t") {
      args.timeframe = argv[++i] as MarketTimeframe;
    } else if (arg === "--format" || arg === "-f") {
      const val = argv[++i]?.toLowerCase();
      if (val === "jsonl" || val === "csv" || val === "json") {
        args.format = val;
      }
    } else if (arg === "--output" || arg === "-o") {
      args.output = argv[++i];
    } else if (arg === "--seed") {
      args.seed = parseInt(argv[++i], 10);
    } else if (arg === "--start-price") {
      args.startPrice = parseFloat(argv[++i]);
    } else if (arg === "--volatility") {
      args.volatility = parseFloat(argv[++i]);
    } else if (arg === "--source") {
      args.source = argv[++i];
    } else if (arg === "--venue") {
      args.venue = argv[++i];
    } else if (arg === "--start-time") {
      const val = argv[++i];
      args.startTime = isNaN(Number(val)) ? new Date(val).getTime() : Number(val);
    } else if (arg === "--chaos") {
      args.chaosPreset = true;
    } else if (arg === "--gaps") {
      args.gapProb = parseFloat(argv[++i]);
    } else if (arg === "--outliers") {
      args.outlierProb = parseFloat(argv[++i]);
    } else if (arg === "--outlier-multiplier") {
      args.outlierMultiplier = parseFloat(argv[++i]);
    } else if (arg === "--delays") {
      args.delayProb = parseFloat(argv[++i]);
    } else if (arg === "--duplicates") {
      args.duplicateProb = parseFloat(argv[++i]);
    } else if (arg === "--stale") {
      args.staleProb = parseFloat(argv[++i]);
    } else if (arg === "--stale-streak") {
      args.staleStreak = parseInt(argv[++i], 10);
    } else if (arg === "--crossed-market") {
      args.crossedMarketProb = parseFloat(argv[++i]);
    } else if (arg === "--malformed") {
      args.malformedProb = parseFloat(argv[++i]);
    } else if (arg === "--summary") {
      args.summary = true;
    } else if (arg === "--validate") {
      args.validate = true;
    }
  }

  return args;
}

function printHelp(): void {
  const helpText = `
================================================================================
INSTITUTIONAL SYNTHETIC MARKET DATA GENERATOR CLI
================================================================================

Generate realistic stochastic tick-by-tick feeds and OHLC bars with microstructure,
deterministic seeding for CI/backtesting, and chaos injection for pipeline stress testing.

USAGE:
  npx tsx scripts/generate-market-data.ts [options]
  npm run generate:data -- [options]

CORE OPTIONS:
  --mode <ticks|bars|both>        Generation target (default: bars)
  --symbols, -s <SYM1,SYM2>       Comma-delimited list of tickers (e.g. AAPL,NVDA,SPY)
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
  --start-time <ISO|ms>           Start UTC timestamp (default: (now - count * timeframe))

CHAOS & REGRESSION STRESS INJECTION:
  --chaos                         Activates institutional stress suite (gaps, outliers, delays, dups, stale)
  --gaps <prob>                   Inject packet drop temporal gaps (0.0 - 1.0, e.g. 0.05)
  --outliers <prob>               Inject price spikes / flash crash outliers (0.0 - 1.0, e.g. 0.02)
  --outlier-multiplier <num>      Price spike multiplier (default: 1.25)
  --delays <prob>                 Inject high network latency skew (0.0 - 1.0, e.g. 0.05)
  --duplicates <prob>             Inject duplicate frames/sequences (0.0 - 1.0, e.g. 0.03)
  --stale <prob>                  Inject frozen price stale streaks (0.0 - 1.0, e.g. 0.02)
  --stale-streak <number>         Length of stale frozen streak (default: 5)
  --crossed-market <prob>         Inject crossed bid/ask quotes (bid > ask) (default: 0.01)
  --malformed <prob>              Inject corrupt payloads (e.g. negative prices, inverted OHLC)

PIPELINE & OBSERVABILITY:
  --summary                       Print statistical summary & anomaly breakdown to stderr
  --validate                      Pass generated output through MarketDataValidationPipeline and report DLQ status
  --help, -h                      Display this help guide

EXAMPLES:
  # 1. Generate 500 clean 1-minute SPY bars in JSONL (piped to stdout)
  npm run generate:data -- --symbols SPY --count 500 --timeframe 1m --format jsonl

  # 2. Generate 1,000 tick-by-tick FX quotes (EUR/USD) to CSV file
  npm run generate:data -- --mode ticks --symbols EUR/USD --count 1000 --format csv --output fx_ticks.csv

  # 3. Deterministic CI regression dataset with seed 42
  npm run generate:data -- --symbols AAPL --count 250 --seed 42 --format jsonl -o ci_aapl_baseline.jsonl

  # 4. Stress-test data pipeline with full chaos injection and real-time validation
  npm run generate:data -- --preset equities --count 1000 --chaos --validate --summary

  # 5. Crypto jump-diffusion simulation saved to JSON
  npm run generate:data -- --symbols BTC/USD --timeframe 5m --count 300 --volatility 0.65 --format json
================================================================================
`;
  console.log(helpText);
}

export function runCli(argv: string[]): void {
  const args = parseCliArgs(argv);

  if (args.help) {
    printHelp();
    return;
  }

  // Configure chaos parameters
  const chaos = args.chaosPreset
    ? {
        gapProbability: 0.05,
        outlierProbability: 0.02,
        outlierMultiplier: args.outlierMultiplier ?? 1.30,
        delayProbability: 0.04,
        delayMinMs: 5000,
        delayMaxMs: 30000,
        duplicateProbability: 0.03,
        duplicateDelayMs: 150,
        staleProbability: 0.02,
        staleStreakLength: args.staleStreak ?? 5,
        crossedMarketProbability: 0.02,
        malformedProbability: 0.01
      }
    : {
        gapProbability: args.gapProb,
        outlierProbability: args.outlierProb,
        outlierMultiplier: args.outlierMultiplier,
        delayProbability: args.delayProb,
        delayMinMs: args.delayMinMs,
        delayMaxMs: args.delayMaxMs,
        duplicateProbability: args.duplicateProb,
        staleProbability: args.staleProb,
        staleStreakLength: args.staleStreak,
        crossedMarketProbability: args.crossedMarketProb,
        malformedProbability: args.malformedProb
      };

  const generator = new SyntheticMarketDataGenerator(args.seed);

  // Prepare symbol configs
  const symbolConfigs = args.symbols.map(sym => {
    const base = PRESET_SYMBOLS[sym];
    return {
      symbol: sym,
      assetClass: base?.assetClass ?? "EQUITIES",
      startPrice: args.startPrice ?? base?.startPrice ?? 100.0,
      annualVolatility: args.volatility ?? base?.annualVolatility ?? 0.25,
      annualDrift: base?.annualDrift ?? 0.05,
      tickSize: base?.tickSize ?? 0.01,
      venue: args.venue ?? base?.venue ?? "XNYS",
      currency: base?.currency ?? "USD",
      averageSpreadBps: base?.averageSpreadBps ?? 2.0,
      averageTradeVolume: base?.averageTradeVolume ?? 100
    };
  });

  const config: GeneratorConfig = {
    mode: args.mode,
    symbols: symbolConfigs,
    count: args.count,
    timeframe: args.timeframe,
    startTime: args.startTime,
    seed: args.seed,
    source: args.source ?? "SyntheticFeed",
    chaos
  };

  const output = generator.generate(config);
  const records = args.mode === "ticks" ? output.ticks : output.bars;

  // Format records
  let serialized = "";
  if (args.format === "csv") {
    serialized = generator.toCSV(records);
  } else if (args.format === "jsonl") {
    serialized = generator.toJSONL(records);
  } else {
    serialized = JSON.stringify(records, null, 2);
  }

  // Handle output destination
  if (args.output) {
    const targetPath = path.resolve(process.cwd(), args.output);
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(targetPath, serialized, "utf-8");
    if (args.summary) {
      process.stderr.write(`[SyntheticGenerator] Successfully wrote ${records.length} records to ${args.output}\n`);
    }
  } else {
    process.stdout.write(serialized + "\n");
  }

  // Optional Validation against MarketDataValidationPipeline
  if (args.validate) {
    const pipeline = new MarketDataValidationPipeline();
    let passedCount = 0;
    let droppedCount = 0;
    let warnedCount = 0;

    for (const record of records) {
      // Validate tick payloads directly
      const outcome = pipeline.process(record as any);
      if (outcome.shouldDrop) {
        droppedCount++;
      } else if (outcome.violations.length > 0) {
        warnedCount++;
      } else {
        passedCount++;
      }
    }

    const valSummary = [
      "",
      "--- PIPELINE VALIDATION AUDIT REPORT ---",
      `Total Evaluated: ${records.length}`,
      `Passed (Clean):  ${passedCount} (${((passedCount / records.length) * 100).toFixed(1)}%)`,
      `Warnings:        ${warnedCount}`,
      `Dropped / DLQ:   ${droppedCount} (${((droppedCount / records.length) * 100).toFixed(1)}%)`,
      "----------------------------------------",
      ""
    ].join("\n");
    process.stderr.write(valSummary);
  }

  // Optional summary output
  if (args.summary) {
    const summaryText = [
      "",
      "--- SYNTHETIC GENERATION SUMMARY ---",
      `Mode:              ${output.summary.mode}`,
      `Symbols:           ${output.summary.symbols.join(", ")}`,
      `Timeframe:         ${output.summary.timeframe}`,
      `Total Generated:   ${output.summary.totalRecordsGenerated}`,
      `Generation Time:   ${output.summary.generationDurationMs}ms`,
      `Seed:              ${output.summary.seedUsed ?? "RANDOM"}`,
      "Anomaly Injections:",
      ...Object.entries(output.summary.anomalyCounts)
        .filter(([_, count]) => count > 0)
        .map(([type, count]) => `  - ${type}: ${count}`),
      "Price Ranges:",
      ...output.summary.symbols.map(s => 
        `  - ${s}: Start=${output.summary.startPriceBySymbol[s]}, Min=${output.summary.minPriceBySymbol[s]}, Max=${output.summary.maxPriceBySymbol[s]}, End=${output.summary.endPriceBySymbol[s]}`
      ),
      "------------------------------------",
      ""
    ].join("\n");
    process.stderr.write(summaryText);
  }
}

// Execute when invoked directly
if (process.argv[1] && process.argv[1].endsWith("generate-market-data.ts")) {
  runCli(process.argv);
}
