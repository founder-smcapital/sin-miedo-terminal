import {
  MarketDataValidationPipeline,
  ErrorCategory,
  ValidationSeverity,
  validateMalformedPayload,
  validateMissingFields,
  validateTimestamps,
  validateMonotonicity,
  validateOutOfRange,
  validateStalePrice,
  validatePriceSpike,
  validateSchemaDrift,
  SlidingWindowDeduplicator,
  ASSET_CLASS_THRESHOLDS,
  MarketDataAlertManager
} from "../../src/validation";

describe("Institutional Market Data Pipeline Validation Suite", () => {
  const baseTime = 1728881112000; // Fixed deterministic timestamp

  describe("Rule 1: Malformed Payloads", () => {
    it("rejects null and undefined payloads with CRITICAL severity", () => {
      const vNull = validateMalformedPayload(null);
      expect(vNull).toHaveLength(1);
      expect(vNull[0].category).toBe(ErrorCategory.MALFORMED_PAYLOAD);
      expect(vNull[0].severity).toBe(ValidationSeverity.CRITICAL);

      const vUndef = validateMalformedPayload(undefined);
      expect(vUndef).toHaveLength(1);
      expect(vUndef[0].category).toBe(ErrorCategory.MALFORMED_PAYLOAD);
    });

    it("rejects arrays and primitives with CRITICAL severity", () => {
      const vArray = validateMalformedPayload([{ symbol: "SPY" }]);
      expect(vArray.length).toBeGreaterThan(0);
      expect(vArray[0].category).toBe(ErrorCategory.MALFORMED_PAYLOAD);

      const vString = validateMalformedPayload("INVALID_RAW_JSON");
      expect(vString.length).toBeGreaterThan(0);
      expect(vString[0].category).toBe(ErrorCategory.MALFORMED_PAYLOAD);
    });

    it("accepts valid JSON objects", () => {
      const violations = validateMalformedPayload({ symbol: "SPY", price: 600 });
      expect(violations).toHaveLength(0);
    });
  });

  describe("Rule 2: Missing Fields", () => {
    it("flags missing mandatory fields (price, sequenceId, ts)", () => {
      const payload = { symbol: "SPY", source: "Finnhub" };
      const violations = validateMissingFields(payload, ["source", "symbol", "price", "sequenceId", "ts"]);

      expect(violations.length).toBe(3); // price, sequenceId, ts missing
      const categories = violations.map((v) => v.category);
      expect(categories).toContain(ErrorCategory.MISSING_FIELD);
    });

    it("flags empty strings or null as missing", () => {
      const payload = { symbol: "", source: "OpenMarket", price: null };
      const violations = validateMissingFields(payload, ["symbol", "source", "price"]);
      expect(violations.length).toBe(2); // symbol is empty string, price is null
    });
  });

  describe("Rule 3: Timestamp Validation", () => {
    const thresholds = ASSET_CLASS_THRESHOLDS.EQUITIES;

    it("rejects negative, zero, and NaN timestamps", () => {
      const vNegative = validateTimestamps(-100, baseTime, thresholds);
      expect(vNegative[0].category).toBe(ErrorCategory.INVALID_TIMESTAMP);

      const vNaN = validateTimestamps(NaN, baseTime, thresholds);
      expect(vNaN[0].category).toBe(ErrorCategory.INVALID_TIMESTAMP);
    });

    it("detects epoch seconds instead of milliseconds (10-digit flaw)", () => {
      const epochSeconds = 1728881112; // 10 digits
      const violations = validateTimestamps(epochSeconds, baseTime, thresholds);
      expect(violations.some((v) => v.ruleName === "TIMESTAMP_UNIT_MILLISECONDS")).toBe(true);
    });

    it("rejects future clock skew exceeding threshold", () => {
      const futureTs = baseTime + 10_000; // 10s into future, max is 3s
      const violations = validateTimestamps(futureTs, baseTime, thresholds);
      expect(violations.some((v) => v.ruleName === "TIMESTAMP_FUTURE_SKEW")).toBe(true);
    });

    it("accepts valid millisecond timestamps within acceptable bounds", () => {
      const validTs = baseTime - 500;
      const violations = validateTimestamps(validTs, baseTime, thresholds);
      expect(violations).toHaveLength(0);
    });
  });

  describe("Rule 4: Monotonic Sequence & Order", () => {
    const thresholds = ASSET_CLASS_THRESHOLDS.EQUITIES;

    it("rejects regressed or stalled sequence numbers", () => {
      const violationsStalled = validateMonotonicity(100, 100, baseTime, baseTime - 100, thresholds);
      expect(violationsStalled.some((v) => v.category === ErrorCategory.NON_MONOTONIC_SEQUENCE)).toBe(true);

      const violationsRegressed = validateMonotonicity(99, 100, baseTime, baseTime - 100, thresholds);
      expect(violationsRegressed.some((v) => v.category === ErrorCategory.NON_MONOTONIC_SEQUENCE)).toBe(true);
    });

    it("flags timestamp time-travel regression backwards", () => {
      const violations = validateMonotonicity(101, 100, baseTime - 5000, baseTime, thresholds);
      expect(violations.some((v) => v.ruleName === "TIMESTAMP_CHRONOLOGICAL_ORDER")).toBe(true);
    });

    it("accepts strictly increasing sequence IDs", () => {
      const violations = validateMonotonicity(105, 104, baseTime + 10, baseTime, thresholds);
      expect(violations).toHaveLength(0);
    });
  });

  describe("Rule 5: Out-of-Range Bounds", () => {
    const equityThresholds = ASSET_CLASS_THRESHOLDS.EQUITIES;

    it("rejects prices outside allowed asset class corridors", () => {
      const vNegative = validateOutOfRange(-10, undefined, undefined, undefined, undefined, equityThresholds);
      expect(vNegative.some((v) => v.category === ErrorCategory.OUT_OF_RANGE)).toBe(true);

      const vExceeded = validateOutOfRange(2_000_000, undefined, undefined, undefined, undefined, equityThresholds);
      expect(vExceeded.some((v) => v.ruleName === "PRICE_RANGE_BOUNDS")).toBe(true);
    });

    it("rejects inverted/crossed order books (bid > ask)", () => {
      const violations = validateOutOfRange(100, 100.5, 100.2, undefined, undefined, equityThresholds);
      expect(violations.some((v) => v.ruleName === "CROSSED_BOOK_ANOMALY")).toBe(true);
    });

    it("rejects negative spreads", () => {
      const violations = validateOutOfRange(100, 100.1, 100.2, -5.2, undefined, equityThresholds);
      expect(violations.some((v) => v.ruleName === "SPREAD_NON_NEGATIVE")).toBe(true);
    });
  });

  describe("Rule 6: Stale Prices", () => {
    const thresholds = ASSET_CLASS_THRESHOLDS.EQUITIES;

    it("flags quotes older than max staleness window", () => {
      const staleTs = baseTime - 25_000; // 25s old, max limit is 15s
      const violations = validateStalePrice(staleTs, baseTime, thresholds);
      expect(violations).toHaveLength(1);
      expect(violations[0].category).toBe(ErrorCategory.STALE_PRICE);
    });

    it("passes fresh quotes within staleness limit", () => {
      const freshTs = baseTime - 2_000;
      const violations = validateStalePrice(freshTs, baseTime, thresholds);
      expect(violations).toHaveLength(0);
    });
  });

  describe("Rule 7: Price Spikes & Flash Anomalies", () => {
    const thresholds = ASSET_CLASS_THRESHOLDS.EQUITIES; // 8% max jump

    it("rejects anomalous price spikes (>8% jump)", () => {
      const prevPrice = 500;
      const currentPrice = 580; // +16% jump
      const violations = validatePriceSpike(currentPrice, prevPrice, thresholds);
      expect(violations).toHaveLength(1);
      expect(violations[0].category).toBe(ErrorCategory.PRICE_SPIKE_ANOMALY);
    });

    it("accepts normal market volatility jumps (<8%)", () => {
      const prevPrice = 500;
      const currentPrice = 505; // +1% move
      const violations = validatePriceSpike(currentPrice, prevPrice, thresholds);
      expect(violations).toHaveLength(0);
    });
  });

  describe("Rule 8: Schema Drift Detection", () => {
    it("detects unrecognized upstream vendor keys", () => {
      const raw = {
        symbol: "SPY",
        price: 590,
        unannounced_beta_feed_field: "XYZ",
        random_vendor_leak: 123
      };
      const violations = validateSchemaDrift(raw);
      expect(violations).toHaveLength(1);
      expect(violations[0].category).toBe(ErrorCategory.SCHEMA_DRIFT);
      expect(violations[0].severity).toBe(ValidationSeverity.WARNING);
    });
  });

  describe("Rule 9: Sliding Window Deduplication", () => {
    it("catches rapid duplicate messages with identical fingerprints", () => {
      const deduplicator = new SlidingWindowDeduplicator(10_000);
      const fp = "OpenMarket:SPY:XNAS:1001:590.2:1728881112000";

      const firstCheck = deduplicator.checkAndRecord(fp, baseTime);
      expect(firstCheck).toBe(false); // First is new

      const secondCheck = deduplicator.checkAndRecord(fp, baseTime + 100);
      expect(secondCheck).toBe(true); // Duplicate detected!
    });
  });

  describe("End-to-End Pipeline Execution", () => {
    let pipeline: MarketDataValidationPipeline;
    let alertManager: MarketDataAlertManager;

    beforeEach(() => {
      alertManager = new MarketDataAlertManager(100, 1000);
      pipeline = new MarketDataValidationPipeline({
        alertManager,
        quarantineOnWarning: false
      });
    });

    it("successfully processes valid canonical ticks", () => {
      const validTick = {
        schemaVersion: "1.0",
        source: "OpenMarket",
        symbol: "SPY",
        assetClass: "EQUITIES",
        price: 602.35,
        bid: 602.34,
        ask: 602.36,
        spreadBps: 0.33,
        volume: 48920,
        sequenceId: 10001,
        venue: "XNAS",
        ts: baseTime,
        changePct: 0.45
      };

      const outcome = pipeline.process(validTick, baseTime);
      expect(outcome.isValid).toBe(true);
      expect(outcome.shouldDrop).toBe(false);
      expect(outcome.validatedData?.symbol).toBe("SPY");
      expect(outcome.latencyUs).toBeGreaterThanOrEqual(0);

      const metrics = alertManager.getMetrics();
      expect(metrics.totalValid).toBe(1);
      expect(metrics.totalDropped).toBe(0);
    });

    it("drops ticks with regressed sequence ID and logs to DLQ", () => {
      const tick1 = {
        source: "OpenMarket",
        symbol: "SPY",
        price: 602.35,
        sequenceId: 500,
        venue: "XNAS",
        ts: baseTime
      };

      const tick2Regressed = {
        source: "OpenMarket",
        symbol: "SPY",
        price: 602.4,
        sequenceId: 499, // Lower than 500!
        venue: "XNAS",
        ts: baseTime + 100
      };

      pipeline.process(tick1, baseTime);
      const outcome = pipeline.process(tick2Regressed, baseTime + 100);

      expect(outcome.isValid).toBe(false);
      expect(outcome.shouldDrop).toBe(true);
      expect(outcome.violations.some((v) => v.category === ErrorCategory.NON_MONOTONIC_SEQUENCE)).toBe(true);

      const dlq = alertManager.getDlqRecords();
      expect(dlq.length).toBe(1);
      expect(dlq[0].symbol).toBe("SPY");
      expect(dlq[0].category).toBe(ErrorCategory.NON_MONOTONIC_SEQUENCE);
    });

    it("drops instantaneous price spikes and preserves prior valid state", () => {
      const normalTick = {
        source: "Finnhub",
        symbol: "NVDA",
        price: 130.0,
        sequenceId: 1,
        venue: "XNAS",
        ts: baseTime
      };

      const spikeTick = {
        source: "Finnhub",
        symbol: "NVDA",
        price: 165.0, // +26.9% spike, exceeds 8% equity limit
        sequenceId: 2,
        venue: "XNAS",
        ts: baseTime + 200
      };

      pipeline.process(normalTick, baseTime);
      const outcome = pipeline.process(spikeTick, baseTime + 200);

      expect(outcome.isValid).toBe(false);
      expect(outcome.shouldDrop).toBe(true);
      expect(outcome.violations.some((v) => v.category === ErrorCategory.PRICE_SPIKE_ANOMALY)).toBe(true);

      // Prior state is preserved: NVDA lastValidPrice remains 130.0
      const state = pipeline.getSymbolState("NVDA");
      expect(state?.lastValidPrice).toBe(130.0);
    });

    it("throttles alert dispatches to prevent notification storms", () => {
      let alertsDispatched = 0;
      alertManager.onAlert(() => {
        alertsDispatched += 1;
      });

      const badTick = {
        source: "VendorX",
        symbol: "TSLA",
        price: -50, // Negative price error
        sequenceId: 1,
        venue: "XNAS",
        ts: baseTime
      };

      // Emit 10 identical bad ticks rapidly
      for (let i = 0; i < 10; i++) {
        pipeline.process({ ...badTick, sequenceId: i + 1 }, baseTime + i * 10);
      }

      // Alert should only trigger once due to throttling!
      expect(alertsDispatched).toBe(1);
      expect(alertManager.getMetrics().totalDropped).toBe(10);
    });
  });
});
