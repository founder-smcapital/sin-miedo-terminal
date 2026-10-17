import {
  MarketDataReconciliationEngine,
  MarketDataDriftDetector,
  MarketDataBackfillEngine,
  IdempotentReconciliationProcessor,
  ReconciliationDLQManager,
  DiscrepancyType,
  ReconciliationSeverity,
  ReconciliationStatus,
  CanonicalBar,
  ReferenceBar,
  calculateBpsDiff,
  calculatePctDiff,
  ASSET_RECONCILIATION_THRESHOLDS
} from "../../src/reconciliation";

describe("Institutional Market Data Reconciliation & Backfill Engine", () => {
  const baseTs = 1728881112000;

  describe("1. Thresholds & Basis-Point Metrics", () => {
    it("accurately calculates basis points and percentage differentials", () => {
      // 100 vs 100.03 is 3 bps
      const bps = calculateBpsDiff(100.03, 100.0);
      expect(bps).toBeCloseTo(3.0, 1);

      // 100 vs 101 is 100 bps
      expect(calculateBpsDiff(101.0, 100.0)).toBeCloseTo(100.0, 1);

      // Percentage difference
      const pct = calculatePctDiff(105, 100);
      expect(pct).toBeCloseTo(5.0, 1);
    });

    it("verifies asset class specific threshold corridors exist", () => {
      expect(ASSET_RECONCILIATION_THRESHOLDS.EQUITIES.maxPriceVarianceBps).toBe(3.0);
      expect(ASSET_RECONCILIATION_THRESHOLDS.FX.maxPriceVarianceBps).toBe(1.5);
      expect(ASSET_RECONCILIATION_THRESHOLDS.CRYPTO.maxPriceVarianceBps).toBe(15.0);
      expect(ASSET_RECONCILIATION_THRESHOLDS.RATES.maxPriceVarianceBps).toBe(0.5);
    });
  });

  describe("2. Canonical vs Reference Bar Comparison (Reconciliation Engine)", () => {
    let reconciler: MarketDataReconciliationEngine;

    beforeEach(() => {
      reconciler = new MarketDataReconciliationEngine();
    });

    it("matches identical canonical and reference bars cleanly", () => {
      const canonical: CanonicalBar = {
        symbol: "AAPL",
        timestamp: baseTs,
        open: 230.1,
        high: 231.5,
        low: 229.8,
        close: 231.0,
        volume: 50000,
        source: "NasdaqFeed"
      };

      const reference: ReferenceBar = {
        symbol: "AAPL",
        timestamp: baseTs,
        open: 230.1,
        high: 231.5,
        low: 229.8,
        close: 231.0,
        volume: 50000,
        source: "SIP_CONSOLIDATED"
      };

      const result = reconciler.reconcileBar(canonical, reference, "EQUITIES");
      expect(result.status).toBe(ReconciliationStatus.MATCHED);
      expect(result.breaks).toHaveLength(0);
      expect(result.varianceBps).toBe(0);
    });

    it("flags price variance breach when variance exceeds tolerance corridor", () => {
      const canonical: CanonicalBar = {
        symbol: "AAPL",
        timestamp: baseTs,
        open: 230.0,
        high: 232.0,
        low: 229.0,
        close: 230.5,
        volume: 50000,
        source: "NasdaqFeed"
      };

      // Reference is 230.0 -> diff is 50 cents on 230 = 21.7 bps (exceeds 3 bps Equities tolerance)
      const reference: ReferenceBar = {
        symbol: "AAPL",
        timestamp: baseTs,
        open: 230.0,
        high: 232.0,
        low: 229.0,
        close: 230.0,
        volume: 50000,
        source: "SIP_CONSOLIDATED"
      };

      const result = reconciler.reconcileBar(canonical, reference, "EQUITIES");
      expect(result.status).toBe(ReconciliationStatus.BREAK_DETECTED);
      expect(result.breaks.length).toBeGreaterThan(0);

      const priceBreak = result.breaks.find((b) => b.discrepancyType === DiscrepancyType.PRICE_VARIANCE_EXCEEDED);
      expect(priceBreak).toBeDefined();
      expect(priceBreak?.bpsDiff).toBeGreaterThan(20);
      expect(priceBreak?.severity).toBe(ReconciliationSeverity.CRITICAL);
    });

    it("identifies unadjusted stock split (corporate action mismatch)", () => {
      const canonical: CanonicalBar = {
        symbol: "NVDA",
        timestamp: baseTs,
        open: 125.0,
        high: 126.0,
        low: 124.0,
        close: 125.0,
        volume: 100000,
        source: "DirectFeed"
      };

      // Unadjusted reference shows old pre-split price ~500.0 (ratio ~ 0.25 -> 4:1 split)
      const reference: ReferenceBar = {
        symbol: "NVDA",
        timestamp: baseTs,
        open: 500.0,
        high: 504.0,
        low: 496.0,
        close: 500.0,
        volume: 25000,
        source: "LegacyVendor"
      };

      const result = reconciler.reconcileBar(canonical, reference, "EQUITIES");
      expect(result.status).toBe(ReconciliationStatus.BREAK_DETECTED);

      const splitBreak = result.breaks.find((b) => b.discrepancyType === DiscrepancyType.CORPORATE_ACTION_UNADJUSTED);
      expect(splitBreak).toBeDefined();
      expect(splitBreak?.severity).toBe(ReconciliationSeverity.CRITICAL);
      expect(splitBreak?.remediationAction).toBe("QUARANTINE_FEED");
    });

    it("detects internal OHLC geometry inconsistency", () => {
      const canonical: CanonicalBar = {
        symbol: "MSFT",
        timestamp: baseTs,
        open: 420.0,
        high: 415.0, // Invalid: High is lower than Open & Close
        low: 410.0,
        close: 422.0,
        volume: 10000,
        source: "FeedA"
      };

      const reference: ReferenceBar = {
        symbol: "MSFT",
        timestamp: baseTs,
        open: 420.0,
        high: 425.0,
        low: 418.0,
        close: 422.0,
        volume: 10000,
        source: "SIP"
      };

      const result = reconciler.reconcileBar(canonical, reference, "EQUITIES");
      const ohlcBreak = result.breaks.find((b) => b.discrepancyType === DiscrepancyType.OHLC_INCONSISTENCY);
      expect(ohlcBreak).toBeDefined();
      expect(ohlcBreak?.severity).toBe(ReconciliationSeverity.CRITICAL);
    });

    it("detects timestamp alignment skew", () => {
      const canonical: CanonicalBar = {
        symbol: "SPY",
        timestamp: baseTs,
        open: 580.0,
        high: 581.0,
        low: 579.5,
        close: 580.5,
        volume: 20000,
        source: "Feed"
      };

      // Reference is 2000ms skewed (exceeds 500ms Equities tolerance)
      const reference: ReferenceBar = {
        symbol: "SPY",
        timestamp: baseTs + 2000,
        open: 580.0,
        high: 581.0,
        low: 579.5,
        close: 580.5,
        volume: 20000,
        source: "SIP"
      };

      const result = reconciler.reconcileBar(canonical, reference, "EQUITIES");
      const timeBreak = result.breaks.find((b) => b.discrepancyType === DiscrepancyType.TIMESTAMP_SKEW_EXCEEDED);
      expect(timeBreak).toBeDefined();
      expect(timeBreak?.absoluteDiff).toBe(2000);
    });

    it("reconciles series and catches missing records on both sides", () => {
      const canonicalBars: CanonicalBar[] = [
        { symbol: "AMZN", timestamp: baseTs, open: 180, high: 181, low: 179, close: 180.5, volume: 1000, source: "Feed" },
        { symbol: "AMZN", timestamp: baseTs + 60000, open: 180.5, high: 182, low: 180, close: 181.5, volume: 1200, source: "Feed" },
        { symbol: "AMZN", timestamp: baseTs + 120000, open: 181.5, high: 183, low: 181, close: 182.0, volume: 800, source: "Feed" } // phantom trade not in reference
      ];

      const referenceBars: ReferenceBar[] = [
        { symbol: "AMZN", timestamp: baseTs, open: 180, high: 181, low: 179, close: 180.5, volume: 1000, source: "SIP" },
        { symbol: "AMZN", timestamp: baseTs + 60000, open: 180.5, high: 182, low: 180, close: 181.5, volume: 1200, source: "SIP" },
        { symbol: "AMZN", timestamp: baseTs + 180000, open: 182.0, high: 184, low: 181.8, close: 183.5, volume: 1500, source: "SIP" } // missing in canonical
      ];

      const report = reconciler.reconcileSeries(canonicalBars, referenceBars, "EQUITIES");
      expect(report.totalBarsEvaluated).toBe(4);
      expect(report.matchedCount).toBe(2);

      const missingRef = report.breaks.find((b) => b.discrepancyType === DiscrepancyType.MISSING_IN_REFERENCE);
      expect(missingRef).toBeDefined();
      expect(missingRef?.timestamp).toBe(baseTs + 120000);

      const missingCan = report.breaks.find((b) => b.discrepancyType === DiscrepancyType.MISSING_IN_CANONICAL);
      expect(missingCan).toBeDefined();
      expect(missingCan?.timestamp).toBe(baseTs + 180000);
      expect(missingCan?.remediationAction).toBe("BACKFILL_TRIGGERED");
    });
  });

  describe("3. Statistical Drift Detection", () => {
    let driftDetector: MarketDataDriftDetector;

    beforeEach(() => {
      driftDetector = new MarketDataDriftDetector({ windowSize: 30, ewmaAlpha: 0.25 });
    });

    it("detects no drift when price discrepancies fluctuate neutrally around 0", () => {
      // Feed noise fluctuating symmetrically +/- 0.5 bps
      for (let i = 0; i < 20; i++) {
        const noise = i % 2 === 0 ? 0.005 : -0.005;
        const refPrice = 100.0;
        const canPrice = 100.0 + noise;
        driftDetector.recordObservation("EUR/USD", "EBS", "ReutersFix", canPrice, refPrice, baseTs + i * 1000, baseTs + i * 1000, "FX");
      }

      const metric = driftDetector.getMetric("EUR/USD", "EBS", "ReutersFix");
      expect(metric).toBeDefined();
      expect(metric?.sampleCount).toBe(20);
      expect(metric?.isSystematicDrift).toBe(false);
      expect(metric?.driftDirection).toBe("NONE");
    });

    it("triggers systematic drift alert when feed has persistent positive pricing skew", () => {
      // Vendor feed quotes consistently 5 basis points higher
      for (let i = 0; i < 25; i++) {
        const refPrice = 100.0;
        const canPrice = 100.05 + (Math.random() * 0.002); // ~5 bps premium
        driftDetector.recordObservation("SPY", "DirectVenue", "SIP", canPrice, refPrice, baseTs + i * 1000, baseTs + i * 1000, "EQUITIES");
      }

      const metric = driftDetector.getMetric("SPY", "DirectVenue", "SIP");
      expect(metric).toBeDefined();
      expect(metric?.sampleCount).toBe(25);
      expect(metric?.isSystematicDrift).toBe(true);
      expect(metric?.driftDirection).toBe("POSITIVE_BIAS");
      expect(metric?.meanBpsDiff).toBeGreaterThan(4.5);
    });

    it("tracks feed latency delta over time", () => {
      for (let i = 0; i < 10; i++) {
        driftDetector.recordObservation("BTC/USD", "Binance", "Coinbase", 65000, 65000, baseTs + 150, baseTs, "CRYPTO");
      }

      const metric = driftDetector.getMetric("BTC/USD", "Binance", "Coinbase");
      expect(metric?.meanLatencyDeltaMs).toBe(150);
    });
  });

  describe("4. Gap Detection and Backfill Engine", () => {
    let backfillEngine: MarketDataBackfillEngine;

    beforeEach(() => {
      backfillEngine = new MarketDataBackfillEngine();
    });

    it("identifies temporal gaps in historical bar series", () => {
      const bars: CanonicalBar[] = [
        { symbol: "QQQ", timestamp: baseTs, open: 490, high: 491, low: 489, close: 490.5, volume: 1000, source: "Feed" },
        { symbol: "QQQ", timestamp: baseTs + 60000, open: 490.5, high: 492, low: 490, close: 491, volume: 1100, source: "Feed" },
        // Missing: baseTs + 120000, baseTs + 180000, baseTs + 240000
        { symbol: "QQQ", timestamp: baseTs + 300000, open: 492, high: 493, low: 491, close: 492.5, volume: 900, source: "Feed" }
      ];

      const gaps = backfillEngine.detectGaps("QQQ", bars, { expectedIntervalMs: 60000 });
      expect(gaps).toHaveLength(1);
      expect(gaps[0].symbol).toBe("QQQ");
      expect(gaps[0].startTs).toBe(baseTs + 60000 + 60000);
      expect(gaps[0].missingBarCount).toBe(3);
    });

    it("creates chunked backfill jobs", () => {
      // 10,000 minutes gap
      const start = baseTs;
      const end = baseTs + 10000 * 60000;
      const job = backfillEngine.createBackfillJob("QQQ", start, end, 60000, "GOLDEN_REFERENCE_OVERWRITE", 500);

      expect(job.status).toBe("PENDING");
      expect(job.totalChunks).toBe(20); // 10,000 / 500 = 20 chunks
    });

    it("merges backfilled bars under GOLDEN_REFERENCE_OVERWRITE policy", () => {
      const existing: CanonicalBar[] = [
        { symbol: "TSLA", timestamp: baseTs, open: 220, high: 221, low: 219, close: 220, volume: 500, source: "Live" }
      ];

      const backfillData: ReferenceBar[] = [
        // Overwrite existing bar with authoritative SIP numbers
        { symbol: "TSLA", timestamp: baseTs, open: 220, high: 222, low: 218.5, close: 220.5, volume: 800, source: "SIP_OFFICIAL" },
        // Fill missing next bar
        { symbol: "TSLA", timestamp: baseTs + 60000, open: 220.5, high: 223, low: 220, close: 222.5, volume: 1200, source: "SIP_OFFICIAL" }
      ];

      const merged = backfillEngine.mergeBackfilledBars(existing, backfillData, "GOLDEN_REFERENCE_OVERWRITE");
      expect(merged).toHaveLength(2);
      expect(merged[0].high).toBe(222); // Overwritten with authoritative
      expect(merged[0].volume).toBe(800);
      expect(merged[1].timestamp).toBe(baseTs + 60000);
    });

    it("executes multi-provider fallback orchestration", async () => {
      const existing: CanonicalBar[] = [
        { symbol: "GOOGL", timestamp: baseTs, open: 170, high: 171, low: 169, close: 170.5, volume: 1000, source: "Feed" }
      ];

      const job = backfillEngine.createBackfillJob("GOOGL", baseTs + 60000, baseTs + 120000, 60000);

      const failingPrimary = {
        name: "PrimaryExchangeApi",
        fetchBars: async () => {
          throw new Error("HTTP 429 Rate limit exceeded");
        }
      };

      const secondaryBackup = {
        name: "ConsolidatedBackupTape",
        fetchBars: async () => [
          { symbol: "GOOGL", timestamp: baseTs + 60000, open: 170.5, high: 172, low: 170, close: 171.5, volume: 2000, source: "BackupTape" }
        ]
      };

      const { updatedSeries, job: completedJob } = await backfillEngine.executeBackfill(
        job.jobId,
        existing,
        [failingPrimary, secondaryBackup]
      );

      expect(completedJob.status).toBe("COMPLETED");
      expect(completedJob.errors.length).toBe(1); // Primary logged error
      expect(completedJob.barsRecovered).toBe(1);
      expect(updatedSeries).toHaveLength(2);
    });
  });

  describe("5. Idempotent Reprocessing", () => {
    let processor: IdempotentReconciliationProcessor;

    beforeEach(() => {
      processor = new IdempotentReconciliationProcessor();
    });

    it("generates deterministic content fingerprints", () => {
      const obj1 = { symbol: "AAPL", price: 230.5, ts: baseTs };
      const obj2 = { ts: baseTs, price: 230.5, symbol: "AAPL" }; // Different key order

      expect(processor.generateFingerprint(obj1)).toBe(processor.generateFingerprint(obj2));
    });

    it("executes handler once and returns cached receipt on duplicate calls", () => {
      let executionCount = 0;
      const key = processor.generateIdempotencyKey("AAPL", baseTs, "EOD_RECON");
      const payload = { symbol: "AAPL", close: 230.0 };

      const handler = (p: typeof payload) => {
        executionCount++;
        return { reconciled: true, price: p.close };
      };

      // First run
      const receipt1 = processor.execute(key, payload, handler);
      expect(receipt1.isDuplicate).toBe(false);
      expect(receipt1.resultPayload?.price).toBe(230.0);
      expect(executionCount).toBe(1);

      // Duplicate run with identical key & payload
      const receipt2 = processor.execute(key, payload, handler);
      expect(receipt2.isDuplicate).toBe(true);
      expect(receipt2.resultPayload?.price).toBe(230.0);
      expect(executionCount).toBe(1); // Handler was NOT invoked again
    });

    it("allows explicit force replay to re-evaluate", () => {
      let executionCount = 0;
      const key = processor.generateIdempotencyKey("AAPL", baseTs);
      const payload = { symbol: "AAPL", close: 230.0 };

      processor.execute(key, payload, () => ++executionCount);
      expect(executionCount).toBe(1);

      // Force replay
      const receiptForce = processor.execute(key, payload, () => ++executionCount, true);
      expect(receiptForce.isDuplicate).toBe(false);
      expect(executionCount).toBe(2);
    });
  });

  describe("6. Dead-Letter Queue (DLQ) & Break Isolation", () => {
    let dlqManager: ReconciliationDLQManager;

    beforeEach(() => {
      dlqManager = new ReconciliationDLQManager();
    });

    it("enqueues broken reconciliation records with diagnostics", () => {
      const entry = dlqManager.enqueue({
        breakId: "BRK-001",
        symbol: "AMZN",
        timestamp: baseTs,
        discrepancyType: DiscrepancyType.PRICE_VARIANCE_EXCEEDED,
        severity: ReconciliationSeverity.CRITICAL,
        canonicalPayload: { price: 185.0 },
        referencePayload: { price: 180.0 },
        diagnostics: "500 bps variance breach"
      });

      expect(entry.dlqId).toBeDefined();
      expect(entry.status).toBe("QUARANTINED");
      expect(dlqManager.count()).toBe(1);
    });

    it("replays DLQ entries and marks as RESOLVED on success", async () => {
      const entry = dlqManager.enqueue({
        breakId: "BRK-002",
        symbol: "MSFT",
        timestamp: baseTs,
        discrepancyType: DiscrepancyType.MISSING_IN_CANONICAL,
        severity: ReconciliationSeverity.ERROR,
        canonicalPayload: null,
        referencePayload: { close: 420.0 },
        diagnostics: "Missing bar"
      });

      const { success, entry: replayed } = await dlqManager.replayEntry(entry.dlqId, async (item) => {
        expect(item.symbol).toBe("MSFT");
        return true; // Simulate successful backfill and reconciliation
      });

      expect(success).toBe(true);
      expect(replayed.status).toBe("RESOLVED");
      expect(replayed.retryCount).toBe(1);
    });

    it("exhausts max retries and preserves quarantine state on persistent failure", async () => {
      const entry = dlqManager.enqueue({
        breakId: "BRK-003",
        symbol: "COIN",
        timestamp: baseTs,
        discrepancyType: DiscrepancyType.PRICE_VARIANCE_EXCEEDED,
        severity: ReconciliationSeverity.CRITICAL,
        canonicalPayload: { price: 250 },
        referencePayload: { price: 210 },
        diagnostics: "Irreconcilable price breach",
        maxRetries: 2
      });

      // Attempt 1 -> fails
      await dlqManager.replayEntry(entry.dlqId, () => false);
      expect(entry.retryCount).toBe(1);
      expect(entry.status).toBe("QUARANTINED");

      // Attempt 2 -> fails, reaches max
      const res2 = await dlqManager.replayEntry(entry.dlqId, () => false);
      expect(res2.success).toBe(false);
      expect(entry.retryCount).toBe(2);
      expect(entry.status).toBe("QUARANTINED");
      expect(entry.resolutionNotes).toContain("Exhausted maximum replay retries");
    });
  });
});
