import { AssetClass, AssetThresholds } from "./types";

/**
 * Institutional Market Data Tolerance & Boundary Corridors
 * Defines asset-specific physics and economic bounds.
 */
export const ASSET_CLASS_THRESHOLDS: Record<AssetClass, AssetThresholds> = {
  EQUITIES: {
    minPrice: 0.0001,
    maxPrice: 1_000_000.0,
    maxSingleTickPercentChange: 0.08,    // 8% instantaneous single-tick jump
    maxStalenessMs: 15_000,              // 15 seconds max lag during market hours
    maxFutureClockSkewMs: 3_000,         // 3 seconds clock skew
    maxPastClockSkewMs: 86_400_000,      // 24 hours back (e.g. daily corrections)
    requireStrictMonotonicSeq: true,
    maxSpreadBps: 500,                   // 500 bps (5%) max acceptable spread
    minSpreadBps: 0                      // Crossed books are rejected
  },
  FX: {
    minPrice: 0.00001,
    maxPrice: 200_000.0,
    maxSingleTickPercentChange: 0.03,    // 3% single tick (FX is very tight)
    maxStalenessMs: 8_000,               // 8 seconds
    maxFutureClockSkewMs: 2_000,         // 2 seconds clock skew
    maxPastClockSkewMs: 43_200_000,      // 12 hours
    requireStrictMonotonicSeq: true,
    maxSpreadBps: 150,                   // 1.5% max spread in normal FX
    minSpreadBps: 0
  },
  CRYPTO: {
    minPrice: 0.00000001,
    maxPrice: 5_000_000.0,
    maxSingleTickPercentChange: 0.15,    // 15% single tick volatility tolerance
    maxStalenessMs: 5_000,               // 5 seconds (fast moving 24/7 tape)
    maxFutureClockSkewMs: 2_000,
    maxPastClockSkewMs: 21_600_000,
    requireStrictMonotonicSeq: false,    // Decentralized venues might have out-of-order sequence IDs
    maxSpreadBps: 800,
    minSpreadBps: 0
  },
  COMMODITIES: {
    minPrice: -50.0,                     // WTI Crude May 2020 precedent (-$37.63/bbl)
    maxPrice: 100_000.0,
    maxSingleTickPercentChange: 0.06,    // 6% single tick
    maxStalenessMs: 20_000,
    maxFutureClockSkewMs: 3_000,
    maxPastClockSkewMs: 86_400_000,
    requireStrictMonotonicSeq: true,
    maxSpreadBps: 400,
    minSpreadBps: 0
  },
  RATES: {
    minPrice: -3.00,                     // Negative yield bounds (e.g. Bunds, Swiss Franc yields)
    maxPrice: 35.00,                     // 35% nominal yield upper bound
    maxSingleTickPercentChange: 0.35,    // 35 bps single tick delta
    maxStalenessMs: 60_000,              // Rates update less frequently
    maxFutureClockSkewMs: 5_000,
    maxPastClockSkewMs: 172_800_000,
    requireStrictMonotonicSeq: false,
    maxSpreadBps: 200,
    minSpreadBps: 0
  },
  OPTIONS: {
    minPrice: 0.0001,
    maxPrice: 50_000.0,
    maxSingleTickPercentChange: 0.50,    // OTM options have high delta swings
    maxStalenessMs: 30_000,
    maxFutureClockSkewMs: 3_000,
    maxPastClockSkewMs: 86_400_000,
    requireStrictMonotonicSeq: false,
    maxSpreadBps: 2500,
    minSpreadBps: 0
  },
  GENERIC: {
    minPrice: 0.0001,
    maxPrice: 10_000_000.0,
    maxSingleTickPercentChange: 0.10,
    maxStalenessMs: 30_000,
    maxFutureClockSkewMs: 5_000,
    maxPastClockSkewMs: 86_400_000,
    requireStrictMonotonicSeq: false,
    maxSpreadBps: 1000,
    minSpreadBps: 0
  }
};

/**
 * Known Canonical Keys allowed on high-frequency market messages.
 * Used for Schema Drift detection.
 */
export const CANONICAL_ALLOWED_KEYS = new Set([
  "schemaVersion",
  "source",
  "symbol",
  "assetClass",
  "price",
  "bid",
  "ask",
  "spreadBps",
  "volume",
  "sequenceId",
  "venue",
  "ts",
  "ingestTs",
  "changePct",
  "attributes",
  "injectedAnomaly",
  "anomalyDetails",
  "isDuplicate"
]);
