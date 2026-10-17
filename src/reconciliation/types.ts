/**
 * Institutional Market Data Reconciliation & Backfill Engine Types
 * Provides strict typing for multi-source cross-verification, reference comparison,
 * statistical drift detection, gap backfilling, and idempotent reprocessing.
 */

import { AssetClass } from "../validation/types";

export type { AssetClass };

export enum DiscrepancyType {
  PRICE_VARIANCE_EXCEEDED = "PRICE_VARIANCE_EXCEEDED",
  VOLUME_VARIANCE_EXCEEDED = "VOLUME_VARIANCE_EXCEEDED",
  OHLC_INCONSISTENCY = "OHLC_INCONSISTENCY",
  MISSING_IN_CANONICAL = "MISSING_IN_CANONICAL",
  MISSING_IN_REFERENCE = "MISSING_IN_REFERENCE",
  TIMESTAMP_SKEW_EXCEEDED = "TIMESTAMP_SKEW_EXCEEDED",
  CORPORATE_ACTION_UNADJUSTED = "CORPORATE_ACTION_UNADJUSTED",
  SYSTEMATIC_DRIFT = "SYSTEMATIC_DRIFT",
  STATUS_HALT_MISMATCH = "STATUS_HALT_MISMATCH"
}

export enum ReconciliationSeverity {
  INFO = "INFO",
  WARNING = "WARNING",
  ERROR = "ERROR",
  CRITICAL = "CRITICAL"
}

export enum ReconciliationStatus {
  MATCHED = "MATCHED",
  MATCHED_WITH_WARNINGS = "MATCHED_WITH_WARNINGS",
  BREAK_DETECTED = "BREAK_DETECTED",
  QUARANTINED_DLQ = "QUARANTINED_DLQ"
}

export interface ReferenceBar {
  symbol: string;
  timestamp: number; // UTC ms epoch
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  vwap?: number;
  officialSettlement?: boolean;
  currency?: string;
  source: string; // e.g., "SIP_CTA_CQ", "CME_SETTLE", "BATS_OFFICIAL"
  isCorporateActionAdjusted?: boolean;
}

export interface CanonicalBar {
  symbol: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  vwap?: number;
  source: string;
  tickCount?: number;
  sequenceStart?: number;
  sequenceEnd?: number;
}

export interface ReconciliationBreak {
  breakId: string;
  symbol: string;
  timestamp: number;
  field: "open" | "high" | "low" | "close" | "volume" | "vwap" | "timestamp" | "record";
  canonicalValue: number | string | null;
  referenceValue: number | string | null;
  absoluteDiff: number;
  bpsDiff: number;
  discrepancyType: DiscrepancyType;
  severity: ReconciliationSeverity;
  thresholdTolerance: number;
  status: "OPEN" | "AUTO_RESOLVED" | "QUARANTINED" | "OVERRIDDEN";
  details: string;
  remediationAction?: "BACKFILL_TRIGGERED" | "OVERWRITE_REFERENCE" | "QUARANTINE_FEED" | "ALERT_ONLY";
}

export interface ReconciliationItemResult {
  symbol: string;
  timestamp: number;
  status: ReconciliationStatus;
  breaks: ReconciliationBreak[];
  varianceBps: number;
}

export interface ReconciliationReport {
  reportId: string;
  timestamp: number;
  symbolsReconciled: string[];
  totalBarsEvaluated: number;
  matchedCount: number;
  breaksCount: number;
  matchRatePct: number;
  breaks: ReconciliationBreak[];
  durationMs: number;
}

export interface AssetReconciliationThresholds {
  maxPriceVarianceBps: number;
  maxCloseVarianceBps: number;
  maxVolumeVariancePct: number;
  maxTimestampSkewMs: number;
  driftThresholdZScore: number;
  minDriftSampleCount: number;
  alertOnOhlcViolations: boolean;
}

export interface DriftObservation {
  timestamp: number;
  canonicalPrice: number;
  referencePrice: number;
  diffBps: number;
  latencyDeltaMs: number;
}

export interface DriftMetric {
  symbol: string;
  source: string;
  referenceSource: string;
  sampleCount: number;
  meanBpsDiff: number;
  stdDevBpsDiff: number;
  zScore: number;
  ewmaBpsDiff: number;
  isSystematicDrift: boolean;
  driftDirection: "POSITIVE_BIAS" | "NEGATIVE_BIAS" | "NONE";
  meanLatencyDeltaMs: number;
  lastUpdated: number;
}

export interface DataGap {
  gapId: string;
  symbol: string;
  startTs: number;
  endTs: number;
  expectedIntervalMs: number;
  missingBarCount: number;
  detectedAt: number;
  reason: "INTERVAL_SILENCE" | "SEQUENCE_HOLE" | "RECONCILIATION_MISSING";
  status: "DETECTED" | "BACKFILL_QUEUED" | "BACKFILLED" | "EXHAUSTED";
}

export type BackfillConflictPolicy =
  | "GOLDEN_REFERENCE_OVERWRITE"
  | "PRESERVE_EXISTING"
  | "MAX_VOLUME_MERGE";

export interface BackfillJob {
  jobId: string;
  symbol: string;
  startTs: number;
  endTs: number;
  resolutionMs: number;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "PARTIAL" | "FAILED";
  totalChunks: number;
  completedChunks: number;
  barsRecovered: number;
  conflictPolicy: BackfillConflictPolicy;
  createdAt: number;
  completedAt?: number;
  errors: string[];
}

export interface IdempotencyReceipt<T = unknown> {
  idempotencyKey: string;
  contentHash: string;
  processedAt: number;
  firstSeenAt: number;
  isDuplicate: boolean;
  resultPayload?: T;
}

export interface ReconciliationDLQEntry {
  dlqId: string;
  enqueuedAt: number;
  breakId: string;
  symbol: string;
  timestamp: number;
  discrepancyType: DiscrepancyType;
  severity: ReconciliationSeverity;
  canonicalPayload: unknown;
  referencePayload: unknown;
  diagnostics: string;
  retryCount: number;
  maxRetries: number;
  status: "QUARANTINED" | "RETRYING" | "RESOLVED" | "DISCARDED";
  resolutionNotes?: string;
}
