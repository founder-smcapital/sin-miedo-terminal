import {
  ErrorCategory,
  ValidationSeverity,
  ValidationRuleViolation,
  AssetThresholds
} from "./types";
import { CANONICAL_ALLOWED_KEYS } from "./thresholds";

/**
 * 1. Malformed Payload Validation
 * Verifies that the raw input is a legitimate non-null object (not array, primitive, null, or undefined).
 */
export function validateMalformedPayload(raw: unknown): ValidationRuleViolation[] {
  const violations: ValidationRuleViolation[] = [];
  const now = Date.now();

  if (raw === null || raw === undefined) {
    violations.push({
      category: ErrorCategory.MALFORMED_PAYLOAD,
      severity: ValidationSeverity.CRITICAL,
      ruleName: "NON_NULL_OBJECT",
      message: "Incoming payload is null or undefined",
      timestamp: now
    });
    return violations;
  }

  if (typeof raw !== "object" || Array.isArray(raw)) {
    violations.push({
      category: ErrorCategory.MALFORMED_PAYLOAD,
      severity: ValidationSeverity.CRITICAL,
      ruleName: "OBJECT_STRUCTURE",
      observedValue: Array.isArray(raw) ? "array" : typeof raw,
      expectedCondition: "Record<string, unknown>",
      message: `Payload must be a JSON object, received ${Array.isArray(raw) ? "array" : typeof raw}`,
      timestamp: now
    });
  }

  return violations;
}

/**
 * 2. Missing Fields Validation
 * Verifies presence of mandatory structural attributes.
 */
export function validateMissingFields(
  payload: Record<string, unknown>,
  requiredFields: string[]
): ValidationRuleViolation[] {
  const violations: ValidationRuleViolation[] = [];
  const now = Date.now();

  for (const field of requiredFields) {
    const val = payload[field];
    if (val === undefined || val === null || val === "") {
      violations.push({
        category: ErrorCategory.MISSING_FIELD,
        severity: ValidationSeverity.ERROR,
        ruleName: `REQUIRED_FIELD_${field.toUpperCase()}`,
        field,
        observedValue: val,
        expectedCondition: "defined non-null value",
        message: `Missing mandatory market data field: '${field}'`,
        timestamp: now
      });
    }
  }

  return violations;
}

/**
 * 3. Timestamp Validation
 * Checks epoch unit (seconds vs milliseconds), clock skew (future ticks), and historical horizon.
 */
export function validateTimestamps(
  ts: unknown,
  currentTimeMs: number,
  thresholds: AssetThresholds
): ValidationRuleViolation[] {
  const violations: ValidationRuleViolation[] = [];
  const now = Date.now();

  if (typeof ts !== "number" || !Number.isFinite(ts) || ts <= 0) {
    violations.push({
      category: ErrorCategory.INVALID_TIMESTAMP,
      severity: ValidationSeverity.CRITICAL,
      ruleName: "TIMESTAMP_FINITE_POSITIVE",
      field: "ts",
      observedValue: ts,
      expectedCondition: "Positive finite integer milliseconds",
      message: `Timestamp 'ts' must be a positive finite integer, received ${String(ts)}`,
      timestamp: now
    });
    return violations;
  }

  // Detect 10-digit epoch seconds accident (e.g. 1728881112 instead of 1728881112000)
  if (ts < 10_000_000_000) {
    violations.push({
      category: ErrorCategory.INVALID_TIMESTAMP,
      severity: ValidationSeverity.ERROR,
      ruleName: "TIMESTAMP_UNIT_MILLISECONDS",
      field: "ts",
      observedValue: ts,
      expectedCondition: "Millisecond timestamp (13 digits)",
      message: `Timestamp appears to be in seconds (${ts}), expected milliseconds (e.g. ${ts * 1000})`,
      timestamp: now
    });
  }

  // Clock Skew check (Tick cannot come from the far future)
  if (ts > currentTimeMs + thresholds.maxFutureClockSkewMs) {
    violations.push({
      category: ErrorCategory.INVALID_TIMESTAMP,
      severity: ValidationSeverity.ERROR,
      ruleName: "TIMESTAMP_FUTURE_SKEW",
      field: "ts",
      observedValue: ts,
      expectedCondition: `<= currentTime + ${thresholds.maxFutureClockSkewMs}ms`,
      message: `Timestamp is ${ts - currentTimeMs}ms in the future (skew exceeds ${thresholds.maxFutureClockSkewMs}ms limit)`,
      timestamp: now
    });
  }

  // Prehistoric / Ancient Tick check
  if (ts < currentTimeMs - thresholds.maxPastClockSkewMs) {
    violations.push({
      category: ErrorCategory.INVALID_TIMESTAMP,
      severity: ValidationSeverity.WARNING,
      ruleName: "TIMESTAMP_PAST_HORIZON",
      field: "ts",
      observedValue: ts,
      expectedCondition: `>= currentTime - ${thresholds.maxPastClockSkewMs}ms`,
      message: `Timestamp is older than allowed historical ingestion window (${thresholds.maxPastClockSkewMs}ms)`,
      timestamp: now
    });
  }

  return violations;
}

/**
 * 4. Monotonic Sequence & Chronological Order Validation
 * Protects against out-of-order execution, replay attacks, or inverted network streams.
 */
export function validateMonotonicity(
  currentSeq: number,
  previousSeq: number | undefined,
  currentTs: number,
  previousTs: number | undefined,
  thresholds: AssetThresholds
): ValidationRuleViolation[] {
  const violations: ValidationRuleViolation[] = [];
  const now = Date.now();

  if (previousSeq !== undefined && thresholds.requireStrictMonotonicSeq) {
    if (currentSeq <= previousSeq) {
      violations.push({
        category: ErrorCategory.NON_MONOTONIC_SEQUENCE,
        severity: ValidationSeverity.ERROR,
        ruleName: "SEQUENCE_MONOTONIC_INCREASING",
        field: "sequenceId",
        observedValue: currentSeq,
        expectedCondition: `> ${previousSeq}`,
        message: `Sequence ID regressed or stalled: current ${currentSeq} <= previous ${previousSeq}`,
        timestamp: now
      });
    }
  }

  if (previousTs !== undefined) {
    // A timestamp regression beyond 200ms indicates packet reordering or multi-producer race
    if (currentTs < previousTs - 200) {
      violations.push({
        category: ErrorCategory.NON_MONOTONIC_SEQUENCE,
        severity: ValidationSeverity.WARNING,
        ruleName: "TIMESTAMP_CHRONOLOGICAL_ORDER",
        field: "ts",
        observedValue: currentTs,
        expectedCondition: `>= ${previousTs}`,
        message: `Timestamp time-travel regression detected: current ts ${currentTs} < previous ts ${previousTs}`,
        timestamp: now
      });
    }
  }

  return violations;
}

/**
 * 5. Out-of-Range Value Validation
 * Checks price boundaries, spread positivity, non-inverted books, and volume validity.
 */
export function validateOutOfRange(
  price: unknown,
  bid: unknown | undefined,
  ask: unknown | undefined,
  spreadBps: unknown | undefined,
  volume: unknown | undefined,
  thresholds: AssetThresholds
): ValidationRuleViolation[] {
  const violations: ValidationRuleViolation[] = [];
  const now = Date.now();

  if (typeof price !== "number" || !Number.isFinite(price)) {
    violations.push({
      category: ErrorCategory.OUT_OF_RANGE,
      severity: ValidationSeverity.CRITICAL,
      ruleName: "PRICE_FINITE_NUMBER",
      field: "price",
      observedValue: price,
      expectedCondition: "Finite number",
      message: `Price is not a finite number: ${String(price)}`,
      timestamp: now
    });
    return violations;
  }

  if (price < thresholds.minPrice || price > thresholds.maxPrice) {
    violations.push({
      category: ErrorCategory.OUT_OF_RANGE,
      severity: ValidationSeverity.ERROR,
      ruleName: "PRICE_RANGE_BOUNDS",
      field: "price",
      observedValue: price,
      expectedCondition: `between ${thresholds.minPrice} and ${thresholds.maxPrice}`,
      message: `Price ${price} is out of allowable corridor [${thresholds.minPrice}, ${thresholds.maxPrice}]`,
      timestamp: now
    });
  }

  // Bid / Ask relationship checks
  if (typeof bid === "number" && typeof ask === "number") {
    if (bid <= 0 || ask <= 0) {
      violations.push({
        category: ErrorCategory.OUT_OF_RANGE,
        severity: ValidationSeverity.ERROR,
        ruleName: "QUOTE_POSITIVE",
        observedValue: { bid, ask },
        message: `Bid (${bid}) and ask (${ask}) must be positive numbers`,
        timestamp: now
      });
    } else if (bid > ask) {
      violations.push({
        category: ErrorCategory.OUT_OF_RANGE,
        severity: ValidationSeverity.ERROR,
        ruleName: "CROSSED_BOOK_ANOMALY",
        observedValue: { bid, ask },
        expectedCondition: "bid <= ask",
        message: `Inverted market quotes: Bid (${bid}) > Ask (${ask})`,
        timestamp: now
      });
    }
  }

  // Spread checks
  if (typeof spreadBps === "number") {
    if (spreadBps < 0) {
      violations.push({
        category: ErrorCategory.OUT_OF_RANGE,
        severity: ValidationSeverity.ERROR,
        ruleName: "SPREAD_NON_NEGATIVE",
        field: "spreadBps",
        observedValue: spreadBps,
        expectedCondition: ">= 0",
        message: `Negative spread detected: ${spreadBps} bps`,
        timestamp: now
      });
    }
    if (thresholds.maxSpreadBps && spreadBps > thresholds.maxSpreadBps) {
      violations.push({
        category: ErrorCategory.OUT_OF_RANGE,
        severity: ValidationSeverity.WARNING,
        ruleName: "EXCESSIVE_SPREAD_WIDENING",
        field: "spreadBps",
        observedValue: spreadBps,
        expectedCondition: `<= ${thresholds.maxSpreadBps} bps`,
        message: `Spread ${spreadBps} bps exceeds maximum threshold of ${thresholds.maxSpreadBps} bps`,
        timestamp: now
      });
    }
  }

  // Volume checks
  if (volume !== undefined && (typeof volume !== "number" || volume < 0 || !Number.isFinite(volume))) {
    violations.push({
      category: ErrorCategory.OUT_OF_RANGE,
      severity: ValidationSeverity.WARNING,
      ruleName: "VOLUME_NON_NEGATIVE",
      field: "volume",
      observedValue: volume,
      expectedCondition: ">= 0",
      message: `Invalid volume figure: ${String(volume)}`,
      timestamp: now
    });
  }

  return violations;
}

/**
 * 6. Stale Price Validation
 * Validates that the tick was not frozen or emitted from an unrefreshed pipeline cache.
 */
export function validateStalePrice(
  ts: number,
  currentTimeMs: number,
  thresholds: AssetThresholds
): ValidationRuleViolation[] {
  const violations: ValidationRuleViolation[] = [];
  const ageMs = currentTimeMs - ts;

  if (ageMs > thresholds.maxStalenessMs) {
    violations.push({
      category: ErrorCategory.STALE_PRICE,
      severity: ValidationSeverity.WARNING,
      ruleName: "MAX_FEED_LATENCY",
      field: "ts",
      observedValue: `${ageMs}ms`,
      expectedCondition: `<= ${thresholds.maxStalenessMs}ms`,
      message: `Stale quote: age of tick (${ageMs}ms) exceeds max staleness limit of ${thresholds.maxStalenessMs}ms`,
      timestamp: currentTimeMs
    });
  }

  return violations;
}

/**
 * 7. Price Spike & Anomaly Validation
 * Computes instantaneous relative jump vs previous valid price.
 */
export function validatePriceSpike(
  currentPrice: number,
  previousPrice: number | undefined,
  thresholds: AssetThresholds
): ValidationRuleViolation[] {
  const violations: ValidationRuleViolation[] = [];
  const now = Date.now();

  if (previousPrice !== undefined && previousPrice > 0 && currentPrice > 0) {
    const pctChange = Math.abs((currentPrice - previousPrice) / previousPrice);
    if (pctChange > thresholds.maxSingleTickPercentChange) {
      const pctFormatted = (pctChange * 100).toFixed(2);
      const limitFormatted = (thresholds.maxSingleTickPercentChange * 100).toFixed(2);
      violations.push({
        category: ErrorCategory.PRICE_SPIKE_ANOMALY,
        severity: ValidationSeverity.ERROR,
        ruleName: "SINGLE_TICK_PRICE_SPIKE",
        field: "price",
        observedValue: `${currentPrice} (jump: ${pctFormatted}%)`,
        expectedCondition: `|ΔP / P_prev| <= ${limitFormatted}%`,
        message: `Flash spike detected: price moved ${pctFormatted}% from ${previousPrice} to ${currentPrice} (threshold: ${limitFormatted}%)`,
        timestamp: now
      });
    }
  }

  return violations;
}

/**
 * 8. Schema Drift & Upstream Mutation Validation
 * Detects unknown vendor keys, unexpected injections, or contract violations.
 */
export function validateSchemaDrift(
  payload: Record<string, unknown>,
  allowedKeys: Set<string> = CANONICAL_ALLOWED_KEYS,
  allowExtraAttributes: boolean = true
): ValidationRuleViolation[] {
  const violations: ValidationRuleViolation[] = [];
  const now = Date.now();

  const extraKeys = Object.keys(payload).filter((key) => !allowedKeys.has(key));

  if (extraKeys.length > 0) {
    if (allowExtraAttributes) {
      violations.push({
        category: ErrorCategory.SCHEMA_DRIFT,
        severity: ValidationSeverity.WARNING,
        ruleName: "SCHEMA_DRIFT_UNRECOGNIZED_KEYS",
        observedValue: extraKeys,
        message: `Upstream vendor schema drift detected. Unrecognized fields: ${extraKeys.join(", ")}`,
        timestamp: now
      });
    } else {
      violations.push({
        category: ErrorCategory.SCHEMA_DRIFT,
        severity: ValidationSeverity.ERROR,
        ruleName: "STRICT_SCHEMA_VIOLATION",
        observedValue: extraKeys,
        message: `Strict schema rejected payload with unmapped attributes: ${extraKeys.join(", ")}`,
        timestamp: now
      });
    }
  }

  return violations;
}

/**
 * 9. Deduplication Manager
 * High-performance sliding window cache using composite keys (symbol + source + sequenceId / hash).
 */
export class SlidingWindowDeduplicator {
  private cache = new Map<string, number>();
  private readonly ttlMs: number;
  private readonly maxCapacity: number;

  constructor(ttlMs: number = 60_000, maxCapacity: number = 20_000) {
    this.ttlMs = ttlMs;
    this.maxCapacity = maxCapacity;
  }

  public checkAndRecord(fingerprint: string, timestampMs: number = Date.now()): boolean {
    this.pruneOldEntries(timestampMs);

    if (this.cache.has(fingerprint)) {
      return true; // Duplicate detected
    }

    if (this.cache.size >= this.maxCapacity) {
      // Evict oldest entry (Map preserves insertion order)
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(fingerprint, timestampMs);
    return false;
  }

  public clear(): void {
    this.cache.clear();
  }

  public size(): number {
    return this.cache.size;
  }

  private pruneOldEntries(now: number): void {
    if (this.cache.size === 0) return;
    const cutoff = now - this.ttlMs;

    for (const [key, ts] of this.cache.entries()) {
      if (ts < cutoff) {
        this.cache.delete(key);
      } else {
        // Since Map keys are ordered by insertion, break on first unexpired entry
        break;
      }
    }
  }
}
