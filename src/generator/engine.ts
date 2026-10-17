/**
 * Institutional Synthetic Market Data Engine
 * Orchestrates stochastic pricing, microstructure simulation, chaos injection
 * (gaps, price spikes/outliers, network delays, duplicate frames, stale pricing),
 * multi-symbol execution, and multi-format serialization (JSONL & CSV).
 */

import { SeededPRNG } from "./prng";
import { FinancialPricingModel } from "./models";
import { resolveSymbolParameters, parseTimeframeToMs } from "./presets";
import {
  GeneratorConfig,
  GenerationOutput,
  GenerationSummary,
  SyntheticTick,
  SyntheticBar,
  AnomalyType,
  ChaosConfig,
  SymbolParameters
} from "./types";

export class SyntheticMarketDataGenerator {
  private prng: SeededPRNG;
  private pricingModel: FinancialPricingModel;

  constructor(seed?: number) {
    this.prng = new SeededPRNG(seed);
    this.pricingModel = new FinancialPricingModel(this.prng);
  }

  /**
   * Primary unified generation entrypoint
   */
  public generate(config: GeneratorConfig): GenerationOutput {
    const startTime = Date.now();
    const resolvedSymbols: SymbolParameters[] = config.symbols.map(s => resolveSymbolParameters(s));
    const allTicks: SyntheticTick[] = [];
    const allBars: SyntheticBar[] = [];

    const anomalyCounts: Record<AnomalyType, number> = {
      [AnomalyType.NONE]: 0,
      [AnomalyType.GAP]: 0,
      [AnomalyType.OUTLIER_SPIKE]: 0,
      [AnomalyType.DELAYED_MESSAGE]: 0,
      [AnomalyType.DUPLICATE_MESSAGE]: 0,
      [AnomalyType.STALE_PRICE]: 0,
      [AnomalyType.CROSSED_MARKET]: 0,
      [AnomalyType.MALFORMED_PAYLOAD]: 0
    };

    const startPriceBySymbol: Record<string, number> = {};
    const endPriceBySymbol: Record<string, number> = {};
    const minPriceBySymbol: Record<string, number> = {};
    const maxPriceBySymbol: Record<string, number> = {};

    for (const symParams of resolvedSymbols) {
      if (config.mode === "ticks" || config.mode === "both") {
        const symbolTicks = this.generateTicksForSymbol(symParams, config, anomalyCounts);
        allTicks.push(...symbolTicks);

        if (symbolTicks.length > 0) {
          startPriceBySymbol[symParams.symbol] = symbolTicks[0].price;
          endPriceBySymbol[symParams.symbol] = symbolTicks[symbolTicks.length - 1].price;
          const prices = symbolTicks.map(t => t.price).filter(p => !isNaN(p) && p > 0);
          minPriceBySymbol[symParams.symbol] = Math.min(...prices);
          maxPriceBySymbol[symParams.symbol] = Math.max(...prices);
        }
      }

      if (config.mode === "bars" || config.mode === "both") {
        const symbolBars = this.generateBarsForSymbol(symParams, config, anomalyCounts);
        allBars.push(...symbolBars);

        if (symbolBars.length > 0) {
          startPriceBySymbol[symParams.symbol] = symbolBars[0].open;
          endPriceBySymbol[symParams.symbol] = symbolBars[symbolBars.length - 1].close;
          const lows = symbolBars.map(b => b.low).filter(l => !isNaN(l) && l > 0);
          const highs = symbolBars.map(b => b.high).filter(h => !isNaN(h) && h > 0);
          minPriceBySymbol[symParams.symbol] = Math.min(...lows);
          maxPriceBySymbol[symParams.symbol] = Math.max(...highs);
        }
      }
    }

    const totalRecords = allTicks.length + allBars.length;
    const intervalMs = parseTimeframeToMs(config.timeframe);
    const startEpoch = config.startTime ?? (Date.now() - config.count * intervalMs);
    const endEpoch = startEpoch + config.count * intervalMs;

    const summary: GenerationSummary = {
      mode: config.mode,
      symbols: resolvedSymbols.map(s => s.symbol),
      totalRecordsGenerated: totalRecords,
      anomalyCounts,
      timeframe: config.timeframe ?? "1m",
      startTime: startEpoch,
      endTime: endEpoch,
      startPriceBySymbol,
      endPriceBySymbol,
      minPriceBySymbol,
      maxPriceBySymbol,
      generationDurationMs: Date.now() - startTime,
      seedUsed: config.seed
    };

    return {
      ticks: allTicks,
      bars: allBars,
      summary
    };
  }

  /**
   * Generates tick-by-tick market feed for a single symbol
   */
  public generateTicksForSymbol(
    params: SymbolParameters,
    config: GeneratorConfig,
    anomalyTracker?: Record<AnomalyType, number>
  ): SyntheticTick[] {
    const ticks: SyntheticTick[] = [];
    const chaos: ChaosConfig = config.chaos ?? {};
    const intervalMs = parseTimeframeToMs(config.timeframe ?? "tick");
    const baseTime = config.startTime ?? (Date.now() - config.count * intervalMs);

    let currentPrice = params.startPrice;
    let sequenceId = 1;
    let staleRemaining = 0;
    let stalePrice = currentPrice;

    for (let i = 0; i < config.count; i++) {
      const eventTime = baseTime + (i * intervalMs);
      const isLastRecord = i === config.count - 1;

      // 1. Check for RANDOM GAP (packet dropped)
      if (chaos.gapProbability && this.prng.nextBoolean(chaos.gapProbability) && !isLastRecord) {
        if (anomalyTracker) anomalyTracker[AnomalyType.GAP]++;
        sequenceId++; // Sequence counter advances, but message was dropped by network
        continue;
      }

      let tickPrice = currentPrice;
      let anomaly = AnomalyType.NONE;
      let details: string | undefined;

      // 2. Check for STALE DATA streak
      if (staleRemaining > 0) {
        tickPrice = stalePrice;
        anomaly = AnomalyType.STALE_PRICE;
        details = `Stale frozen price repeating: remaining=${staleRemaining}`;
        staleRemaining--;
      } else if (chaos.staleProbability && this.prng.nextBoolean(chaos.staleProbability)) {
        staleRemaining = (chaos.staleStreakLength ?? 5) - 1;
        stalePrice = currentPrice;
        tickPrice = stalePrice;
        anomaly = AnomalyType.STALE_PRICE;
        details = `Entered stale frozen price streak for ${chaos.staleStreakLength ?? 5} periods`;
      } else {
        // Normal stochastic step
        const step = this.pricingModel.stepPrice(currentPrice, params, intervalMs);
        currentPrice = step.nextPrice;
        tickPrice = currentPrice;
      }

      // 3. Check for OUTLIER / PRICE SPIKE
      if (chaos.outlierProbability && this.prng.nextBoolean(chaos.outlierProbability)) {
        anomaly = AnomalyType.OUTLIER_SPIKE;
        const multiplier = chaos.outlierMultiplier ?? 1.25;
        // 50% chance spike up, 50% flash crash down
        const direction = this.prng.nextBoolean(0.5) ? multiplier : (1 / multiplier);
        tickPrice = this.pricingModel.roundToTickSize(tickPrice * direction, params.tickSize);
        details = `Price spike outlier injected: direction=${direction.toFixed(2)}x`;
      }

      // Microstructure quote & execution
      const quote = this.pricingModel.generateQuoteAndTrade(tickPrice, params);
      let bid = quote.bid;
      let ask = quote.ask;
      let tradePrice = quote.tradePrice;
      let tradeVol = quote.tradeVolume;

      // 4. Check for CROSSED MARKET anomaly (Bid > Ask)
      if (chaos.crossedMarketProbability && this.prng.nextBoolean(chaos.crossedMarketProbability)) {
        anomaly = AnomalyType.CROSSED_MARKET;
        const temp = bid;
        bid = this.pricingModel.roundToTickSize(ask + (params.tickSize * 2), params.tickSize);
        ask = temp;
        details = `Crossed book market injected: bid=${bid} > ask=${ask}`;
      }

      // 5. Ingestion timestamp calculation (check for DELAYED MESSAGE)
      let ingestTime = eventTime + this.prng.nextInt(2, 15); // Normal 2-15ms network latency
      if (chaos.delayProbability && this.prng.nextBoolean(chaos.delayProbability)) {
        anomaly = AnomalyType.DELAYED_MESSAGE;
        const delayMs = this.prng.nextInt(chaos.delayMinMs ?? 5000, chaos.delayMaxMs ?? 60000);
        ingestTime = eventTime + delayMs;
        details = `High latency feed delay: ${delayMs}ms`;
      }

      // 6. Check for MALFORMED PAYLOAD anomaly
      if (chaos.malformedProbability && this.prng.nextBoolean(chaos.malformedProbability)) {
        anomaly = AnomalyType.MALFORMED_PAYLOAD;
        tickPrice = -Math.abs(tickPrice);
        details = "Malformed negative price injected";
      }

      const tick: SyntheticTick = {
        schemaVersion: "1.0",
        source: config.source ?? "SyntheticFeed",
        symbol: params.symbol,
        assetClass: params.assetClass,
        price: tickPrice,
        bid,
        ask,
        spreadBps: quote.spreadBps,
        volume: tradeVol,
        sequenceId: sequenceId++,
        venue: params.venue,
        ts: eventTime,
        ingestTs: ingestTime,
        injectedAnomaly: anomaly,
        anomalyDetails: details
      };

      if (anomalyTracker) anomalyTracker[anomaly]++;
      ticks.push(tick);

      // 7. Check for DUPLICATE MESSAGE injection
      if (chaos.duplicateProbability && this.prng.nextBoolean(chaos.duplicateProbability)) {
        const dupDelay = chaos.duplicateDelayMs ?? 100;
        const duplicateTick: SyntheticTick = {
          ...tick,
          ingestTs: tick.ingestTs + dupDelay,
          isDuplicate: true,
          injectedAnomaly: AnomalyType.DUPLICATE_MESSAGE,
          anomalyDetails: `Duplicate frame of sequence ${tick.sequenceId}`
        };
        if (anomalyTracker) anomalyTracker[AnomalyType.DUPLICATE_MESSAGE]++;
        ticks.push(duplicateTick);
      }
    }

    return ticks;
  }

  /**
   * Generates OHLC bars for a single symbol
   */
  public generateBarsForSymbol(
    params: SymbolParameters,
    config: GeneratorConfig,
    anomalyTracker?: Record<AnomalyType, number>
  ): SyntheticBar[] {
    const bars: SyntheticBar[] = [];
    const chaos: ChaosConfig = config.chaos ?? {};
    const intervalMs = parseTimeframeToMs(config.timeframe ?? "1m");
    const baseTime = config.startTime ?? (Date.now() - config.count * intervalMs);

    let currentPrice = params.startPrice;
    let sequenceCounter = 1000;
    let staleRemaining = 0;
    let staleBarPrice = currentPrice;

    for (let i = 0; i < config.count; i++) {
      const barTimestamp = baseTime + (i * intervalMs);
      const isLastRecord = i === config.count - 1;

      // 1. Check for RANDOM GAP (missing bar)
      if (chaos.gapProbability && this.prng.nextBoolean(chaos.gapProbability) && !isLastRecord) {
        if (anomalyTracker) anomalyTracker[AnomalyType.GAP]++;
        sequenceCounter += 10;
        continue;
      }

      let openPrice = currentPrice;
      let anomaly = AnomalyType.NONE;
      let details: string | undefined;

      // 2. Check for STALE DATA streak
      if (staleRemaining > 0) {
        openPrice = staleBarPrice;
        anomaly = AnomalyType.STALE_PRICE;
        details = `Stale frozen bar: remaining=${staleRemaining}`;
        staleRemaining--;
      } else if (chaos.staleProbability && this.prng.nextBoolean(chaos.staleProbability)) {
        staleRemaining = (chaos.staleStreakLength ?? 5) - 1;
        staleBarPrice = currentPrice;
        openPrice = staleBarPrice;
        anomaly = AnomalyType.STALE_PRICE;
        details = `Entered stale frozen bar streak for ${chaos.staleStreakLength ?? 5} bars`;
      }

      // Generate intra-bar path
      const intra = this.pricingModel.generateBarIntraPath(openPrice, params, intervalMs);
      let open = intra.open;
      let high = intra.high;
      let low = intra.low;
      let close = intra.close;
      let volume = intra.volume;
      let vwap = intra.vwap;

      if (anomaly === AnomalyType.STALE_PRICE) {
        // Flatline open, high, low, close with 0 volume during a freeze
        open = staleBarPrice;
        high = staleBarPrice;
        low = staleBarPrice;
        close = staleBarPrice;
        volume = 0;
        vwap = staleBarPrice;
      }

      currentPrice = close;

      // 3. Check for OUTLIER / SPIKE
      if (chaos.outlierProbability && this.prng.nextBoolean(chaos.outlierProbability)) {
        anomaly = AnomalyType.OUTLIER_SPIKE;
        const multiplier = chaos.outlierMultiplier ?? 1.25;
        const direction = this.prng.nextBoolean(0.5) ? multiplier : (1 / multiplier);
        close = this.pricingModel.roundToTickSize(close * direction, params.tickSize);
        if (direction > 1) {
          high = Math.max(high, close);
        } else {
          low = Math.min(low, close);
        }
        details = `OHLC price spike injected: close shifted by ${direction.toFixed(2)}x`;
      }

      // 4. Check for MALFORMED PAYLOAD (e.g., high < low inconsistency)
      if (chaos.malformedProbability && this.prng.nextBoolean(chaos.malformedProbability)) {
        anomaly = AnomalyType.MALFORMED_PAYLOAD;
        const temp = high;
        high = low - 1.0; // Invert high and low to test OHLC validation rules
        low = temp;
        details = "Malformed OHLC: high lower than low";
      }

      const seqStart = sequenceCounter;
      const seqEnd = sequenceCounter + 12;
      sequenceCounter = seqEnd + 1;

      const bar: SyntheticBar = {
        symbol: params.symbol,
        timestamp: barTimestamp,
        open,
        high,
        low,
        close,
        volume,
        vwap,
        source: config.source ?? "SyntheticFeed",
        tickCount: 12,
        sequenceStart: seqStart,
        sequenceEnd: seqEnd,
        injectedAnomaly: anomaly,
        anomalyDetails: details
      };

      if (anomalyTracker) anomalyTracker[anomaly]++;
      bars.push(bar);

      // 5. Check for DUPLICATE MESSAGE
      if (chaos.duplicateProbability && this.prng.nextBoolean(chaos.duplicateProbability)) {
        const duplicateBar: SyntheticBar = {
          ...bar,
          isDuplicate: true,
          injectedAnomaly: AnomalyType.DUPLICATE_MESSAGE,
          anomalyDetails: `Duplicate frame of timestamp ${bar.timestamp}`
        };
        if (anomalyTracker) anomalyTracker[AnomalyType.DUPLICATE_MESSAGE]++;
        bars.push(duplicateBar);
      }
    }

    return bars;
  }

  /**
   * Serializes synthetic records to standard CSV (RFC 4180 compliant)
   */
  public toCSV(records: (SyntheticTick | SyntheticBar)[]): string {
    if (records.length === 0) return "";

    const isTick = "price" in records[0];

    if (isTick) {
      const headers = [
        "symbol",
        "timestamp_utc_ms",
        "iso_time",
        "price",
        "bid",
        "ask",
        "spread_bps",
        "volume",
        "sequence_id",
        "venue",
        "source",
        "ingest_timestamp_utc_ms",
        "injected_anomaly",
        "is_duplicate"
      ];

      const rows = (records as SyntheticTick[]).map(t => [
        t.symbol,
        t.ts,
        new Date(t.ts).toISOString(),
        t.price,
        t.bid ?? "",
        t.ask ?? "",
        t.spreadBps ?? "",
        t.volume ?? "",
        t.sequenceId,
        t.venue,
        t.source,
        t.ingestTs,
        t.injectedAnomaly ?? AnomalyType.NONE,
        t.isDuplicate ? "true" : "false"
      ].join(","));

      return [headers.join(","), ...rows].join("\n");
    } else {
      const headers = [
        "symbol",
        "timestamp_utc_ms",
        "iso_time",
        "open",
        "high",
        "low",
        "close",
        "volume",
        "vwap",
        "tick_count",
        "source",
        "injected_anomaly",
        "is_duplicate"
      ];

      const rows = (records as SyntheticBar[]).map(b => [
        b.symbol,
        b.timestamp,
        new Date(b.timestamp).toISOString(),
        b.open,
        b.high,
        b.low,
        b.close,
        b.volume,
        b.vwap ?? "",
        b.tickCount ?? "",
        b.source,
        b.injectedAnomaly ?? AnomalyType.NONE,
        b.isDuplicate ? "true" : "false"
      ].join(","));

      return [headers.join(","), ...rows].join("\n");
    }
  }

  /**
   * Serializes synthetic records to JSONL (Newline-Delimited JSON)
   */
  public toJSONL(records: (SyntheticTick | SyntheticBar)[]): string {
    return records.map(r => JSON.stringify(r)).join("\n");
  }
}
