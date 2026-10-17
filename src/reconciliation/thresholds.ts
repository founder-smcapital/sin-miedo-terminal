import { AssetClass, AssetReconciliationThresholds } from "./types";

/**
 * Institutional Market Data Reconciliation Corridors
 * Specifies strict mathematical boundaries for cross-venue reconciliation,
 * official settlement checks, and drift alerts.
 */
export const ASSET_RECONCILIATION_THRESHOLDS: Record<AssetClass, AssetReconciliationThresholds> = {
  EQUITIES: {
    maxPriceVarianceBps: 3.0,          // 3 bps acceptable variance against Consolidated Tape / SIP
    maxCloseVarianceBps: 1.0,          // 1 bps variance against Official Closing Cross
    maxVolumeVariancePct: 0.5,         // 0.5% volume variance tolerance
    maxTimestampSkewMs: 500,           // Max 500ms timestamp alignment window
    driftThresholdZScore: 2.5,         // 2.5 std deviations flags systematic vendor drift
    minDriftSampleCount: 15,           // Minimum observation count before triggering drift alarm
    alertOnOhlcViolations: true
  },
  FX: {
    maxPriceVarianceBps: 1.5,          // Institutional FX composite (EBS/Reuters/Currenex)
    maxCloseVarianceBps: 1.0,          // 5pm NY Fix tolerance
    maxVolumeVariancePct: 5.0,         // OTC FX volumes are indicative
    maxTimestampSkewMs: 250,           // 250ms alignment window
    driftThresholdZScore: 2.2,
    minDriftSampleCount: 20,
    alertOnOhlcViolations: true
  },
  CRYPTO: {
    maxPriceVarianceBps: 15.0,         // Fragmented liquidity across global centralized & decentralized venues
    maxCloseVarianceBps: 8.0,          // UTC Midnight close index (e.g. CME CF Benchmark)
    maxVolumeVariancePct: 10.0,
    maxTimestampSkewMs: 1500,
    driftThresholdZScore: 3.0,
    minDriftSampleCount: 20,
    alertOnOhlcViolations: true
  },
  COMMODITIES: {
    maxPriceVarianceBps: 2.5,          // WTI / Brent / Gold vs CME / ICE settlements
    maxCloseVarianceBps: 1.0,          // Daily settlement price tolerance
    maxVolumeVariancePct: 1.0,
    maxTimestampSkewMs: 500,
    driftThresholdZScore: 2.5,
    minDriftSampleCount: 15,
    alertOnOhlcViolations: true
  },
  RATES: {
    maxPriceVarianceBps: 0.5,          // SOFR / US Treasuries (yield / price highly sensitive)
    maxCloseVarianceBps: 0.25,         // 3 PM NY Fed Treasury close
    maxVolumeVariancePct: 2.0,
    maxTimestampSkewMs: 250,
    driftThresholdZScore: 2.0,
    minDriftSampleCount: 10,
    alertOnOhlcViolations: true
  },
  OPTIONS: {
    maxPriceVarianceBps: 25.0,         // Wider bid-ask corridors & complex Greeks calculation
    maxCloseVarianceBps: 15.0,
    maxVolumeVariancePct: 5.0,
    maxTimestampSkewMs: 1000,
    driftThresholdZScore: 3.0,
    minDriftSampleCount: 15,
    alertOnOhlcViolations: false
  },
  GENERIC: {
    maxPriceVarianceBps: 5.0,
    maxCloseVarianceBps: 2.5,
    maxVolumeVariancePct: 2.0,
    maxTimestampSkewMs: 1000,
    driftThresholdZScore: 2.5,
    minDriftSampleCount: 15,
    alertOnOhlcViolations: true
  }
};

/**
 * Helper to compute basis points difference between two prices:
 * |(a - b) / b| * 10,000
 */
export function calculateBpsDiff(observed: number, reference: number): number {
  if (reference === 0) return observed === 0 ? 0 : 10000;
  return Math.abs((observed - reference) / reference) * 10000;
}

/**
 * Helper to compute percentage difference:
 * |(a - b) / b| * 100
 */
export function calculatePctDiff(observed: number, reference: number): number {
  if (reference === 0) return observed === 0 ? 0 : 100;
  return Math.abs((observed - reference) / reference) * 100;
}
