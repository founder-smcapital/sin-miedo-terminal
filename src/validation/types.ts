/**
 * Institutional Market Data Validation Pipeline Types
 * Strict type definitions for raw feed validation, anomaly detection, and DLQ handling.
 */

export enum ErrorCategory {
  MALFORMED_PAYLOAD = "MALFORMED_PAYLOAD",
  SCHEMA_DRIFT = "SCHEMA_DRIFT",
  MISSING_FIELD = "MISSING_FIELD",
  INVALID_TIMESTAMP = "INVALID_TIMESTAMP",
  NON_MONOTONIC_SEQUENCE = "NON_MONOTONIC_SEQUENCE",
  DUPLICATE_MESSAGE = "DUPLICATE_MESSAGE",
  OUT_OF_RANGE = "OUT_OF_RANGE",
  PRICE_SPIKE_ANOMALY = "PRICE_SPIKE_ANOMALY",
  STALE_PRICE = "STALE_PRICE"
}

export enum ValidationSeverity {
  INFO = "INFO",
  WARNING = "WARNING",
  ERROR = "ERROR",
  CRITICAL = "CRITICAL"
}

export type AssetClass =
  | "EQUITIES"
  | "FX"
  | "CRYPTO"
  | "COMMODITIES"
  | "RATES"
  | "OPTIONS"
  | "GENERIC";

export interface CanonicalMarketTick {
  schemaVersion: "1.0";
  source: string;              // e.g., "Polygon", "Finnhub", "OpenMarket", "CME"
  symbol: string;              // Normalized ticker (e.g., "SPY", "EUR/USD", "BTC/USD")
  assetClass: AssetClass;
  price: number;
  bid?: number;
  ask?: number;
  spreadBps?: number;
  volume?: number;
  sequenceId: number;          // Monotonically increasing per symbol & venue
  venue: string;               // e.g., "XNYS", "XNAS", "XCME", "FX"
  ts: number;                  // Milliseconds UTC Unix epoch
  ingestTs: number;            // Pipeline receipt timestamp (ms UTC)
  changePct?: number;          // Percent change (e.g., 0.45 = +0.45%)
  attributes?: Record<string, unknown>;
}

export interface ValidationRuleViolation {
  category: ErrorCategory;
  severity: ValidationSeverity;
  ruleName: string;
  field?: string;
  observedValue?: unknown;
  expectedCondition?: string;
  message: string;
  timestamp: number;
}

export interface ValidationOutcome<T = CanonicalMarketTick> {
  isValid: boolean;
  isQuarantined: boolean;
  shouldDrop: boolean;
  validatedData?: T;
  violations: ValidationRuleViolation[];
  latencyUs: number; // In-memory validation latency in microseconds
  fingerprint: string;
}

export interface SymbolState {
  symbol: string;
  lastValidPrice: number;
  lastValidTimestamp: number;
  lastValidSequence: number;
  movingAveragePrice?: number;
  ewmaPrice?: number;
  lastTickCount: number;
}

export interface AssetThresholds {
  minPrice: number;
  maxPrice: number;
  maxSingleTickPercentChange: number; // e.g. 0.08 = 8%
  maxStalenessMs: number;             // e.g. 10000ms
  maxFutureClockSkewMs: number;       // e.g. 2000ms
  maxPastClockSkewMs: number;         // e.g. 86400000ms (24h)
  requireStrictMonotonicSeq: boolean;
  maxSpreadBps?: number;
  minSpreadBps?: number;
}

export interface DeadLetterRecord {
  dlqId: string;
  receivedAt: string;
  source: string;
  symbol: string;
  category: ErrorCategory;
  severity: ValidationSeverity;
  violations: ValidationRuleViolation[];
  rawPayload: unknown;
  headers?: Record<string, string>;
}

export interface PipelineMetrics {
  totalReceived: number;
  totalValid: number;
  totalQuarantined: number;
  totalDropped: number;
  violationsByCategory: Record<ErrorCategory, number>;
  violationsBySeverity: Record<ValidationSeverity, number>;
  lastViolationAt?: string;
}
