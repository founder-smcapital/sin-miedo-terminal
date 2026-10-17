/**
 * Institutional Synthetic Market Data Generator QA & Regression Test Suite
 * Validates deterministic PRNG reproducibility, stochastic diffusion boundaries,
 * OHLC structural invariants, chaos injections (gaps, outliers, delays, duplicates, stale data),
 * multi-format serialization (JSONL/CSV), and validation pipeline integration.
 */

import {
  SyntheticMarketDataGenerator,
  SeededPRNG,
  FinancialPricingModel,
  PRESET_SYMBOLS,
  AnomalyType,
  resolveSymbolParameters
} from "../../src/generator";
import { MarketDataValidationPipeline } from "../../src/validation";
import { MarketDataReconciliationEngine, MarketDataBackfillEngine } from "../../src/reconciliation";

describe("Institutional Synthetic Market Data Generator", () => {
  describe("1. Deterministic PRNG & Reproducibility", () => {
    test("Same seed produces 100% byte-for-byte identical tick feeds", () => {
      const gen1 = new SyntheticMarketDataGenerator(42);
      const gen2 = new SyntheticMarketDataGenerator(42);

      const out1 = gen1.generate({
        mode: "ticks",
        symbols: ["SPY"],
        count: 50,
        timeframe: "1s",
        seed: 42
      });

      const out2 = gen2.generate({
        mode: "ticks",
        symbols: ["SPY"],
        count: 50,
        timeframe: "1s",
        seed: 42
      });

      expect(out1.ticks.length).toBe(50);
      expect(out2.ticks.length).toBe(50);

      for (let i = 0; i < 50; i++) {
        expect(out1.ticks[i].price).toBe(out2.ticks[i].price);
        expect(out1.ticks[i].bid).toBe(out2.ticks[i].bid);
        expect(out1.ticks[i].ask).toBe(out2.ticks[i].ask);
        expect(out1.ticks[i].volume).toBe(out2.ticks[i].volume);
        expect(out1.ticks[i].sequenceId).toBe(out2.ticks[i].sequenceId);
      }
    });

    test("Different seeds produce divergent stochastic price paths", () => {
      const gen1 = new SyntheticMarketDataGenerator(101);
      const gen2 = new SyntheticMarketDataGenerator(202);

      const out1 = gen1.generate({ mode: "bars", symbols: ["AAPL"], count: 20, seed: 101 });
      const out2 = gen2.generate({ mode: "bars", symbols: ["AAPL"], count: 20, seed: 202 });

      const finalClose1 = out1.bars[out1.bars.length - 1].close;
      const finalClose2 = out2.bars[out2.bars.length - 1].close;

      expect(finalClose1).not.toBe(finalClose2);
    });

    test("PRNG Gaussian distribution satisfies standard normal moments", () => {
      const prng = new SeededPRNG(777);
      const n = 5000;
      let sum = 0;
      let sumSq = 0;

      for (let i = 0; i < n; i++) {
        const val = prng.nextGaussian(0, 1);
        sum += val;
        sumSq += val * val;
      }

      const mean = sum / n;
      const variance = (sumSq / n) - (mean * mean);

      // Mean should be near 0 and variance near 1
      expect(Math.abs(mean)).toBeLessThan(0.08);
      expect(Math.abs(variance - 1.0)).toBeLessThan(0.10);
    });
  });

  describe("2. Pricing Physics & Microstructure", () => {
    test("Prices remain strictly positive and quantized to tickSize", () => {
      const gen = new SyntheticMarketDataGenerator(555);
      const out = gen.generate({
        mode: "ticks",
        symbols: ["EUR/USD"],
        count: 100,
        seed: 555
      });

      for (const tick of out.ticks) {
        expect(tick.price).toBeGreaterThan(0);
        // EUR/USD tick size is 0.0001 (4 decimal places)
        const decimals = tick.price.toString().split(".")[1]?.length || 0;
        expect(decimals).toBeLessThanOrEqual(4);
      }
    });

    test("Clean bid-ask quotes maintain Ask > Bid with realistic spread", () => {
      const gen = new SyntheticMarketDataGenerator(1234);
      const out = gen.generate({
        mode: "ticks",
        symbols: ["NVDA"],
        count: 50,
        seed: 1234
      });

      for (const tick of out.ticks) {
        expect(tick.ask).toBeDefined();
        expect(tick.bid).toBeDefined();
        expect(tick.ask!).toBeGreaterThan(tick.bid!);
        expect(tick.spreadBps).toBeGreaterThan(0);
      }
    });
  });

  describe("3. OHLC Bar Structural Invariants", () => {
    test("All generated bars strictly satisfy financial boundary invariants", () => {
      const gen = new SyntheticMarketDataGenerator(888);
      const out = gen.generate({
        mode: "bars",
        symbols: ["SPY", "BTC/USD", "ES_F"],
        count: 100,
        timeframe: "5m",
        seed: 888
      });

      expect(out.bars.length).toBe(300);

      for (const bar of out.bars) {
        // High must be >= Open, Close, Low
        expect(bar.high).toBeGreaterThanOrEqual(bar.open);
        expect(bar.high).toBeGreaterThanOrEqual(bar.close);
        expect(bar.high).toBeGreaterThanOrEqual(bar.low);

        // Low must be <= Open, Close, High
        expect(bar.low).toBeLessThanOrEqual(bar.open);
        expect(bar.low).toBeLessThanOrEqual(bar.close);

        // Volume must be non-negative
        expect(bar.volume).toBeGreaterThanOrEqual(0);

        // VWAP must reside within [Low, High]
        if (bar.vwap !== undefined) {
          expect(bar.vwap).toBeGreaterThanOrEqual(bar.low);
          expect(bar.vwap).toBeLessThanOrEqual(bar.high);
        }
      }
    });

    test("Bar timestamps increment precisely by timeframe interval", () => {
      const gen = new SyntheticMarketDataGenerator(321);
      const out = gen.generate({
        mode: "bars",
        symbols: ["AAPL"],
        count: 10,
        timeframe: "1m",
        seed: 321
      });

      for (let i = 1; i < out.bars.length; i++) {
        const delta = out.bars[i].timestamp - out.bars[i - 1].timestamp;
        expect(delta).toBe(60_000); // 1 minute in ms
      }
    });
  });

  describe("4. Chaos & Regression Stress Injections", () => {
    test("Random gaps injection omits records while advancing timeline", () => {
      const gen = new SyntheticMarketDataGenerator(42);
      const out = gen.generate({
        mode: "bars",
        symbols: ["SPY"],
        count: 100,
        seed: 42,
        chaos: {
          gapProbability: 0.25 // High gap probability
        }
      });

      expect(out.summary.anomalyCounts[AnomalyType.GAP]).toBeGreaterThan(5);
      // Because gaps drop records, total generated is less than count
      expect(out.bars.length).toBeLessThan(100);

      // Verify that at least one gap jump exists in timestamps
      let gapFound = false;
      for (let i = 1; i < out.bars.length; i++) {
        const diff = out.bars[i].timestamp - out.bars[i - 1].timestamp;
        if (diff > 60_000) {
          gapFound = true;
          break;
        }
      }
      expect(gapFound).toBe(true);
    });

    test("Outlier price spikes are injected and flagged", () => {
      const gen = new SyntheticMarketDataGenerator(999);
      const out = gen.generate({
        mode: "bars",
        symbols: ["TSLA"],
        count: 100,
        seed: 999,
        chaos: {
          outlierProbability: 0.15,
          outlierMultiplier: 1.50
        }
      });

      expect(out.summary.anomalyCounts[AnomalyType.OUTLIER_SPIKE]).toBeGreaterThan(3);

      const spikes = out.bars.filter(b => b.injectedAnomaly === AnomalyType.OUTLIER_SPIKE);
      expect(spikes.length).toBeGreaterThan(0);
      expect(spikes[0].anomalyDetails).toContain("OHLC price spike injected");
    });

    test("Delayed message injection creates high ingestion latency skew", () => {
      const gen = new SyntheticMarketDataGenerator(77);
      const out = gen.generate({
        mode: "ticks",
        symbols: ["MSFT"],
        count: 50,
        seed: 77,
        chaos: {
          delayProbability: 0.20,
          delayMinMs: 10000,
          delayMaxMs: 20000
        }
      });

      const delayed = out.ticks.filter(t => t.injectedAnomaly === AnomalyType.DELAYED_MESSAGE);
      expect(delayed.length).toBeGreaterThan(0);

      for (const t of delayed) {
        const latency = t.ingestTs - t.ts;
        expect(latency).toBeGreaterThanOrEqual(10000);
      }
    });

    test("Duplicate message injection replicates frames with identical timestamps", () => {
      const gen = new SyntheticMarketDataGenerator(88);
      const out = gen.generate({
        mode: "ticks",
        symbols: ["SPY"],
        count: 50,
        seed: 88,
        chaos: {
          duplicateProbability: 0.20
        }
      });

      const duplicates = out.ticks.filter(t => t.isDuplicate);
      expect(duplicates.length).toBeGreaterThan(0);
      expect(duplicates[0].injectedAnomaly).toBe(AnomalyType.DUPLICATE_MESSAGE);
    });

    test("Stale data streak freezes prices across multiple consecutive periods", () => {
      const gen = new SyntheticMarketDataGenerator(456);
      const out = gen.generate({
        mode: "bars",
        symbols: ["AAPL"],
        count: 60,
        seed: 456,
        chaos: {
          staleProbability: 0.10,
          staleStreakLength: 4
        }
      });

      const staleBars = out.bars.filter(b => b.injectedAnomaly === AnomalyType.STALE_PRICE);
      expect(staleBars.length).toBeGreaterThanOrEqual(4);

      // Verify that during stale bars, open = high = low = close
      for (const b of staleBars) {
        expect(b.open).toBe(b.close);
        expect(b.high).toBe(b.low);
        expect(b.volume).toBe(0);
      }
    });

    test("Crossed market injection yields bid > ask", () => {
      const gen = new SyntheticMarketDataGenerator(12);
      const out = gen.generate({
        mode: "ticks",
        symbols: ["SPY"],
        count: 40,
        seed: 12,
        chaos: {
          crossedMarketProbability: 0.30
        }
      });

      const crossed = out.ticks.filter(t => t.injectedAnomaly === AnomalyType.CROSSED_MARKET);
      expect(crossed.length).toBeGreaterThan(0);
      for (const c of crossed) {
        expect(c.bid!).toBeGreaterThan(c.ask!);
      }
    });
  });

  describe("5. Serialization Formats (CSV & JSONL)", () => {
    test("toCSV produces RFC-compliant headers and parseable rows for ticks", () => {
      const gen = new SyntheticMarketDataGenerator(10);
      const out = gen.generate({ mode: "ticks", symbols: ["AAPL"], count: 5, seed: 10 });
      const csv = gen.toCSV(out.ticks);

      const lines = csv.trim().split("\n");
      expect(lines.length).toBe(6); // 1 header + 5 rows
      expect(lines[0]).toBe("symbol,timestamp_utc_ms,iso_time,price,bid,ask,spread_bps,volume,sequence_id,venue,source,ingest_timestamp_utc_ms,injected_anomaly,is_duplicate");

      const firstRow = lines[1].split(",");
      expect(firstRow[0]).toBe("AAPL");
      expect(Number(firstRow[3])).toBeGreaterThan(0); // Price
    });

    test("toCSV produces RFC-compliant headers and parseable rows for bars", () => {
      const gen = new SyntheticMarketDataGenerator(10);
      const out = gen.generate({ mode: "bars", symbols: ["SPY"], count: 5, seed: 10 });
      const csv = gen.toCSV(out.bars);

      const lines = csv.trim().split("\n");
      expect(lines.length).toBe(6);
      expect(lines[0]).toContain("symbol,timestamp_utc_ms,iso_time,open,high,low,close,volume,vwap");
    });

    test("toJSONL outputs valid individual JSON records per line", () => {
      const gen = new SyntheticMarketDataGenerator(10);
      const out = gen.generate({ mode: "bars", symbols: ["NVDA"], count: 10, seed: 10 });
      const jsonl = gen.toJSONL(out.bars);

      const lines = jsonl.trim().split("\n");
      expect(lines.length).toBe(10);

      for (const line of lines) {
        const parsed = JSON.parse(line);
        expect(parsed.symbol).toBe("NVDA");
        expect(parsed.open).toBeDefined();
        expect(parsed.close).toBeDefined();
      }
    });
  });

  describe("6. Integration with Pipeline & Reconciliation Subsystems", () => {
    test("Clean synthetic tick feed passes validation pipeline with 0 dropped frames", () => {
      const gen = new SyntheticMarketDataGenerator(9001);
      const out = gen.generate({
        mode: "ticks",
        symbols: ["SPY"],
        count: 50,
        seed: 9001
      });

      const pipeline = new MarketDataValidationPipeline();
      let dropped = 0;

      for (const tick of out.ticks) {
        const result = pipeline.process(tick);
        if (result.shouldDrop) {
          dropped++;
        }
      }

      expect(dropped).toBe(0);
    });

    test("Chaos synthetic ticks properly trigger expected pipeline violations", () => {
      const gen = new SyntheticMarketDataGenerator(9002);
      const out = gen.generate({
        mode: "ticks",
        symbols: ["TSLA"],
        count: 100,
        seed: 9002,
        chaos: {
          duplicateProbability: 0.10,
          outlierProbability: 0.10,
          malformedProbability: 0.05
        }
      });

      const pipeline = new MarketDataValidationPipeline();
      const detectedCategories = new Set<string>();

      for (const tick of out.ticks) {
        const result = pipeline.process(tick);
        for (const v of result.violations) {
          detectedCategories.add(v.category);
        }
      }

      // Should have triggered at least one anomaly category like OUT_OF_RANGE or DUPLICATE_MESSAGE
      expect(detectedCategories.size).toBeGreaterThan(0);
    });

    test("Clean synthetic bars reconcile against identical reference bars with 100% MATCHED", () => {
      const gen = new SyntheticMarketDataGenerator(42);
      const out = gen.generate({
        mode: "bars",
        symbols: ["SPY"],
        count: 20,
        seed: 42
      });

      const referenceBars = out.bars.map(b => ({
        ...b,
        source: "SIP_OFFICIAL"
      }));

      const reconciler = new MarketDataReconciliationEngine();
      const report = reconciler.reconcileSeries(out.bars, referenceBars, "EQUITIES");

      expect(report.matchRatePct).toBe(100);
      expect(report.breaks.length).toBe(0);
      expect(report.matchedCount).toBe(20);
    });

    test("Synthetic gaps are accurately detected by BackfillEngine", () => {
      const gen = new SyntheticMarketDataGenerator(100);
      const out = gen.generate({
        mode: "bars",
        symbols: ["AAPL"],
        count: 50,
        seed: 100,
        chaos: {
          gapProbability: 0.25
        }
      });

      const backfillEngine = new MarketDataBackfillEngine();
      const gaps = backfillEngine.detectGaps("AAPL", out.bars, { expectedIntervalMs: 60_000 });

      expect(gaps.length).toBeGreaterThan(0);
      for (const gap of gaps) {
        expect(gap.symbol).toBe("AAPL");
        expect(gap.missingBarCount).toBeGreaterThanOrEqual(1);
        expect(gap.expectedIntervalMs).toBe(60_000);
      }
    });
  });
});
