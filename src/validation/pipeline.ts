import {
  CanonicalMarketTick,
  ValidationOutcome,
  ValidationRuleViolation,
  ValidationSeverity,
  ErrorCategory,
  SymbolState,
  AssetClass
} from "./types";
import { ASSET_CLASS_THRESHOLDS } from "./thresholds";
import {
  validateMalformedPayload,
  validateMissingFields,
  validateTimestamps,
  validateMonotonicity,
  validateOutOfRange,
  validateStalePrice,
  validatePriceSpike,
  validateSchemaDrift,
  SlidingWindowDeduplicator
} from "./rules";
import { MarketDataAlertManager } from "./alertManager";

export interface PipelineOptions {
  strictSchema?: boolean;
  alertManager?: MarketDataAlertManager;
  deduplicationWindowMs?: number;
  quarantineOnWarning?: boolean;
}

/**
 * Institutional Market Data Validation Pipeline
 * High-throughput stream validator processing feeds against quantitative risk corridors.
 */
export class MarketDataValidationPipeline {
  private symbolStates = new Map<string, SymbolState>();
  private deduplicator: SlidingWindowDeduplicator;
  private alertManager: MarketDataAlertManager;
  private readonly strictSchema: boolean;
  private readonly quarantineOnWarning: boolean;

  constructor(options: PipelineOptions = {}) {
    this.strictSchema = options.strictSchema ?? false;
    this.quarantineOnWarning = options.quarantineOnWarning ?? false;
    this.deduplicator = new SlidingWindowDeduplicator(options.deduplicationWindowMs ?? 60_000);
    this.alertManager = options.alertManager ?? new MarketDataAlertManager();
  }

  public getAlertManager(): MarketDataAlertManager {
    return this.alertManager;
  }

  public resetState(symbolOrKey?: string): void {
    if (symbolOrKey) {
      const symUpper = symbolOrKey.toUpperCase();
      for (const key of this.symbolStates.keys()) {
        if (key === symbolOrKey || key.endsWith(`:${symUpper}`)) {
          this.symbolStates.delete(key);
        }
      }
    } else {
      this.symbolStates.clear();
      this.deduplicator.clear();
    }
  }

  public getSymbolState(symbolOrKey: string): SymbolState | undefined {
    if (this.symbolStates.has(symbolOrKey)) {
      return this.symbolStates.get(symbolOrKey);
    }
    const symUpper = symbolOrKey.toUpperCase();
    for (const [key, state] of this.symbolStates.entries()) {
      if (key.endsWith(`:${symUpper}`) || state.symbol === symUpper) {
        return state;
      }
    }
    return undefined;
  }

  /**
   * Main pipeline ingress: validates an incoming raw message.
   * Returns a clean ValidationOutcome with strict drop/quarantine flags.
   */
  public process(raw: unknown, referenceTimeMs: number = Date.now()): ValidationOutcome<CanonicalMarketTick> {
    const startUs = process.hrtime.bigint();
    const violations: ValidationRuleViolation[] = [];

    // Step 1: Malformed Payload Check
    const malformedViolations = validateMalformedPayload(raw);
    if (malformedViolations.length > 0) {
      violations.push(...malformedViolations);
      const latencyUs = Number((process.hrtime.bigint() - startUs) / 1000n);
      this.alertManager.recordViolation("UNKNOWN", "UNKNOWN", violations, raw, true, false);

      return {
        isValid: false,
        isQuarantined: false,
        shouldDrop: true,
        violations,
        latencyUs,
        fingerprint: "malformed"
      };
    }

    const payload = raw as Record<string, unknown>;

    // Step 2: Schema Drift Check
    const driftViolations = validateSchemaDrift(payload, undefined, !this.strictSchema);
    violations.push(...driftViolations);

    // Step 3: Missing Fields Check
    const requiredFields = ["source", "symbol", "price", "sequenceId", "ts", "venue"];
    const missingViolations = validateMissingFields(payload, requiredFields);
    if (missingViolations.length > 0) {
      violations.push(...missingViolations);
      const symbol = String(payload.symbol || "UNKNOWN");
      const source = String(payload.source || "UNKNOWN");
      const latencyUs = Number((process.hrtime.bigint() - startUs) / 1000n);

      this.alertManager.recordViolation(source, symbol, violations, raw, true, false);

      return {
        isValid: false,
        isQuarantined: false,
        shouldDrop: true,
        violations,
        latencyUs,
        fingerprint: `${source}:${symbol}:missing`
      };
    }

    const symbol = String(payload.symbol).toUpperCase();
    const source = String(payload.source);
    const venue = String(payload.venue || "GENERIC");
    const assetClass: AssetClass = (payload.assetClass as AssetClass) || this.inferAssetClass(symbol);
    const thresholds = ASSET_CLASS_THRESHOLDS[assetClass] || ASSET_CLASS_THRESHOLDS.GENERIC;

    const price = Number(payload.price);
    const sequenceId = Number(payload.sequenceId);
    const ts = Number(payload.ts);
    const bid = payload.bid !== undefined ? Number(payload.bid) : undefined;
    const ask = payload.ask !== undefined ? Number(payload.ask) : undefined;
    const spreadBps = payload.spreadBps !== undefined ? Number(payload.spreadBps) : undefined;
    const volume = payload.volume !== undefined ? Number(payload.volume) : undefined;

    // Step 4: Timestamp Validation
    const tsViolations = validateTimestamps(ts, referenceTimeMs, thresholds);
    violations.push(...tsViolations);

    // Step 5: Duplicate Message Detection
    const fingerprint = `${source}:${symbol}:${venue}:${sequenceId}:${price}:${ts}`;
    const isDuplicate = this.deduplicator.checkAndRecord(fingerprint, referenceTimeMs);
    if (isDuplicate) {
      violations.push({
        category: ErrorCategory.DUPLICATE_MESSAGE,
        severity: ValidationSeverity.ERROR,
        ruleName: "DEDUPLICATION_CACHE_HIT",
        observedValue: fingerprint,
        message: `Duplicate tick detected: identical sequenceId or fingerprint received for ${symbol}`,
        timestamp: referenceTimeMs
      });
    }

    // Symbol Historical State Retrieval
    const stateKey = `${source}:${venue}:${symbol}`;
    const prevState = this.symbolStates.get(stateKey);

    // Step 6: Monotonicity Validation (Sequence & Chronological)
    const monoViolations = validateMonotonicity(
      sequenceId,
      prevState?.lastValidSequence,
      ts,
      prevState?.lastValidTimestamp,
      thresholds
    );
    violations.push(...monoViolations);

    // Step 7: Out-of-Range Bounds Validation
    const rangeViolations = validateOutOfRange(price, bid, ask, spreadBps, volume, thresholds);
    violations.push(...rangeViolations);

    // Step 8: Price Spike & Flash Crash Validation
    const spikeViolations = validatePriceSpike(price, prevState?.lastValidPrice, thresholds);
    violations.push(...spikeViolations);

    // Step 9: Stale Price Validation
    const staleViolations = validateStalePrice(ts, referenceTimeMs, thresholds);
    violations.push(...staleViolations);

    // Decision Logic
    const hasCritical = violations.some((v) => v.severity === ValidationSeverity.CRITICAL);
    const hasError = violations.some((v) => v.severity === ValidationSeverity.ERROR);
    const hasWarning = violations.some((v) => v.severity === ValidationSeverity.WARNING);

    const shouldDrop = hasCritical || hasError;
    const isQuarantined = !shouldDrop && hasWarning && this.quarantineOnWarning;
    const isValid = !shouldDrop && (!hasWarning || !this.quarantineOnWarning);

    const latencyUs = Number((process.hrtime.bigint() - startUs) / 1000n);

    if (shouldDrop) {
      this.alertManager.recordViolation(source, symbol, violations, raw, true, false);
      return {
        isValid: false,
        isQuarantined: false,
        shouldDrop: true,
        violations,
        latencyUs,
        fingerprint
      };
    }

    if (isQuarantined) {
      this.alertManager.recordViolation(source, symbol, violations, raw, false, true);
    } else {
      this.alertManager.recordSuccess();
    }

    // Update Symbol Historical State upon valid acceptance
    const tickCount = (prevState?.lastTickCount || 0) + 1;
    const updatedState: SymbolState = {
      symbol,
      lastValidPrice: price,
      lastValidTimestamp: ts,
      lastValidSequence: sequenceId,
      lastTickCount: tickCount,
      movingAveragePrice: prevState?.movingAveragePrice
        ? prevState.movingAveragePrice * 0.9 + price * 0.1
        : price
    };
    this.symbolStates.set(stateKey, updatedState);

    const validatedData: CanonicalMarketTick = {
      schemaVersion: "1.0",
      source,
      symbol,
      assetClass,
      price,
      bid,
      ask,
      spreadBps,
      volume,
      sequenceId,
      venue,
      ts,
      ingestTs: referenceTimeMs,
      changePct: payload.changePct !== undefined ? Number(payload.changePct) : undefined,
      attributes: payload.attributes as Record<string, unknown> | undefined
    };

    return {
      isValid: true,
      isQuarantined,
      shouldDrop: false,
      validatedData,
      violations,
      latencyUs,
      fingerprint
    };
  }

  private inferAssetClass(symbol: string): AssetClass {
    const s = symbol.toUpperCase();
    if (s.includes("/") || s.includes("EUR") || s.includes("JPY") || s.includes("GBP")) {
      return "FX";
    }
    if (s.includes("BTC") || s.includes("ETH") || s.includes("SOL")) {
      return "CRYPTO";
    }
    if (s.includes("CL=") || s.includes("GC=") || s.includes("BRENT") || s.includes("GOLD") || s.includes("OIL")) {
      return "COMMODITIES";
    }
    if (s.includes("US10Y") || s.includes("US02Y") || s.includes("FEDFUNDS") || s.includes("YIELD")) {
      return "RATES";
    }
    return "EQUITIES";
  }
}
