/**
 * Institutional Synthetic Market Data Generator Types
 * Supports tick-by-tick feeds, OHLC bars, stochastic diffusion modeling,
 * chaos injection (gaps, outliers, delays, duplicates, stale streaks),
 * symbol presets, and multi-format serialization.
 */

import { AssetClass, CanonicalMarketTick } from "../validation/types";
import { CanonicalBar } from "../reconciliation/types";

export type { AssetClass };

export type MarketTimeframe =
  | "tick"
  | "1s"
  | "5s"
  | "1m"
  | "5m"
  | "15m"
  | "30m"
  | "1h"
  | "4h"
  | "1d";

export enum AnomalyType {
  NONE = "NONE",
  GAP = "GAP",
  OUTLIER_SPIKE = "OUTLIER_SPIKE",
  DELAYED_MESSAGE = "DELAYED_MESSAGE",
  DUPLICATE_MESSAGE = "DUPLICATE_MESSAGE",
  STALE_PRICE = "STALE_PRICE",
  CROSSED_MARKET = "CROSSED_MARKET",
  MALFORMED_PAYLOAD = "MALFORMED_PAYLOAD"
}

export interface ChaosConfig {
  /** Probability of dropping/skipping an expected timestamp or sequence (0.0 to 1.0) */
  gapProbability?: number;
  /** Probability of generating an abnormal price spike or flash drop (0.0 to 1.0) */
  outlierProbability?: number;
  /** Relative multiplier for price spike, e.g. 1.30 = +30% or 0.70 = -30% (default: 1.25) */
  outlierMultiplier?: number;
  /** Probability of packet delay where ingest timestamp lags event timestamp significantly */
  delayProbability?: number;
  /** Minimum delay latency in ms (default: 5000) */
  delayMinMs?: number;
  /** Maximum delay latency in ms (default: 60000) */
  delayMaxMs?: number;
  /** Probability of re-emitting duplicate message with same timestamp or sequence (0.0 to 1.0) */
  duplicateProbability?: number;
  /** Delay in ms before duplicate message arrives (default: 150) */
  duplicateDelayMs?: number;
  /** Probability of entering a frozen/stale price streak */
  staleProbability?: number;
  /** Number of periods price remains identical during a stale streak (default: 5) */
  staleStreakLength?: number;
  /** Probability of a crossed market (bid > ask) on tick generation */
  crossedMarketProbability?: number;
  /** Probability of malformed payload (negative prices, missing fields) */
  malformedProbability?: number;
}

export interface SymbolParameters {
  symbol: string;
  assetClass: AssetClass;
  startPrice: number;
  annualVolatility: number;       // e.g., 0.20 for 20%
  annualDrift?: number;           // e.g., 0.05 for 5%
  tickSize: number;               // Minimum price increment (e.g. 0.01, 0.0001)
  venue: string;                  // e.g., "XNYS", "XNAS", "XCME", "FX"
  currency?: string;              // "USD", "EUR", etc.
  averageSpreadBps?: number;      // e.g., 2.5 bps
  averageTradeVolume?: number;    // e.g., 100 shares / contracts
}

export interface GeneratorConfig {
  mode: "ticks" | "bars" | "both";
  symbols: (string | SymbolParameters)[];
  timeframe?: MarketTimeframe;
  count: number;                  // Number of bars or ticks to generate per symbol
  startTime?: number;             // UTC ms epoch (defaults to rounded recent epoch)
  endTime?: number;
  seed?: number;                  // Deterministic pseudo-random seed (crucial for reproducible CI)
  source?: string;                // Source venue identifier (default: "SyntheticFeed")
  chaos?: ChaosConfig;
}

export interface SyntheticTick extends CanonicalMarketTick {
  injectedAnomaly?: AnomalyType;
  anomalyDetails?: string;
  isDuplicate?: boolean;
}

export interface SyntheticBar extends CanonicalBar {
  injectedAnomaly?: AnomalyType;
  anomalyDetails?: string;
  isDuplicate?: boolean;
}

export interface GenerationSummary {
  mode: "ticks" | "bars" | "both";
  symbols: string[];
  totalRecordsGenerated: number;
  anomalyCounts: Record<AnomalyType, number>;
  timeframe: MarketTimeframe;
  startTime: number;
  endTime: number;
  startPriceBySymbol: Record<string, number>;
  endPriceBySymbol: Record<string, number>;
  minPriceBySymbol: Record<string, number>;
  maxPriceBySymbol: Record<string, number>;
  generationDurationMs: number;
  seedUsed?: number;
}

export interface GenerationOutput {
  ticks: SyntheticTick[];
  bars: SyntheticBar[];
  summary: GenerationSummary;
}
