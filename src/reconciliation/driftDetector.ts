import {
  AssetClass,
  DriftMetric,
  DriftObservation
} from "./types";
import { ASSET_RECONCILIATION_THRESHOLDS } from "./thresholds";

export interface DriftDetectionOptions {
  windowSize?: number;
  ewmaAlpha?: number;
}

export class MarketDataDriftDetector {
  private readonly windowSize: number;
  private readonly ewmaAlpha: number;
  private observations: Map<string, DriftObservation[]> = new Map();
  private metricsCache: Map<string, DriftMetric> = new Map();

  constructor(options: DriftDetectionOptions = {}) {
    this.windowSize = options.windowSize || 50;
    this.ewmaAlpha = options.ewmaAlpha || 0.2;
  }

  private getKey(symbol: string, source: string, referenceSource: string): string {
    return `${symbol.toUpperCase()}:${source}:${referenceSource}`;
  }

  /**
   * Records a paired price & latency observation between a canonical feed and reference benchmark.
   */
  public recordObservation(
    symbol: string,
    source: string,
    referenceSource: string,
    canonicalPrice: number,
    referencePrice: number,
    canonicalTs: number,
    referenceTs: number,
    assetClass: AssetClass = "EQUITIES"
  ): DriftMetric {
    const key = this.getKey(symbol, source, referenceSource);
    let list = this.observations.get(key);
    if (!list) {
      list = [];
      this.observations.set(key, list);
    }

    // Difference in basis points: ((canonical - reference) / reference) * 10,000
    const diffBps = referencePrice > 0
      ? ((canonicalPrice - referencePrice) / referencePrice) * 10000
      : 0;

    const latencyDeltaMs = canonicalTs - referenceTs;

    const obs: DriftObservation = {
      timestamp: Date.now(),
      canonicalPrice,
      referencePrice,
      diffBps,
      latencyDeltaMs
    };

    list.push(obs);
    if (list.length > this.windowSize) {
      list.shift();
    }

    const metric = this.computeMetric(symbol, source, referenceSource, list, assetClass);
    this.metricsCache.set(key, metric);
    return metric;
  }

  private computeMetric(
    symbol: string,
    source: string,
    referenceSource: string,
    samples: DriftObservation[],
    assetClass: AssetClass
  ): DriftMetric {
    const thresholds = ASSET_RECONCILIATION_THRESHOLDS[assetClass] || ASSET_RECONCILIATION_THRESHOLDS.GENERIC;
    const n = samples.length;

    if (n === 0) {
      return {
        symbol,
        source,
        referenceSource,
        sampleCount: 0,
        meanBpsDiff: 0,
        stdDevBpsDiff: 0,
        zScore: 0,
        ewmaBpsDiff: 0,
        isSystematicDrift: false,
        driftDirection: "NONE",
        meanLatencyDeltaMs: 0,
        lastUpdated: Date.now()
      };
    }

    // 1. Mean Bps Difference
    const sumBps = samples.reduce((acc, s) => acc + s.diffBps, 0);
    const meanBpsDiff = sumBps / n;

    // 2. Standard Deviation of Bps
    const variance = samples.reduce((acc, s) => acc + Math.pow(s.diffBps - meanBpsDiff, 2), 0) / (n > 1 ? n - 1 : 1);
    const stdDevBpsDiff = Math.sqrt(variance);

    // 3. EWMA calculation
    let ewma = samples[0].diffBps;
    for (let i = 1; i < n; i++) {
      ewma = this.ewmaAlpha * samples[i].diffBps + (1 - this.ewmaAlpha) * ewma;
    }

    // 4. Standard Error & Z-Score
    // Standard error of the mean = stdDev / sqrt(N)
    const stdError = stdDevBpsDiff / Math.sqrt(n);
    const zScore = stdError > 0.00001 ? Math.abs(meanBpsDiff) / stdError : Math.abs(meanBpsDiff);

    // 5. Directional consistency & systematic drift assessment
    const positiveCount = samples.filter((s) => s.diffBps > 0.1).length;
    const negativeCount = samples.filter((s) => s.diffBps < -0.1).length;
    const hasDirectionalDominance = (positiveCount / n > 0.8) || (negativeCount / n > 0.8);

    const isSystematicDrift =
      n >= thresholds.minDriftSampleCount &&
      (zScore >= thresholds.driftThresholdZScore || (Math.abs(meanBpsDiff) > thresholds.maxPriceVarianceBps && hasDirectionalDominance));

    let driftDirection: "POSITIVE_BIAS" | "NEGATIVE_BIAS" | "NONE" = "NONE";
    if (isSystematicDrift) {
      driftDirection = meanBpsDiff > 0 ? "POSITIVE_BIAS" : "NEGATIVE_BIAS";
    }

    // Mean Latency Delta
    const sumLatency = samples.reduce((acc, s) => acc + s.latencyDeltaMs, 0);
    const meanLatencyDeltaMs = sumLatency / n;

    return {
      symbol,
      source,
      referenceSource,
      sampleCount: n,
      meanBpsDiff: Number(meanBpsDiff.toFixed(3)),
      stdDevBpsDiff: Number(stdDevBpsDiff.toFixed(3)),
      zScore: Number(zScore.toFixed(2)),
      ewmaBpsDiff: Number(ewma.toFixed(3)),
      isSystematicDrift,
      driftDirection,
      meanLatencyDeltaMs: Number(meanLatencyDeltaMs.toFixed(1)),
      lastUpdated: Date.now()
    };
  }

  public getMetric(symbol: string, source: string, referenceSource: string): DriftMetric | undefined {
    return this.metricsCache.get(this.getKey(symbol, source, referenceSource));
  }

  public getAllMetrics(): DriftMetric[] {
    return Array.from(this.metricsCache.values());
  }

  public reset(symbol?: string): void {
    if (symbol) {
      const symUpper = symbol.toUpperCase();
      for (const k of this.observations.keys()) {
        if (k.startsWith(`${symUpper}:`)) {
          this.observations.delete(k);
          this.metricsCache.delete(k);
        }
      }
    } else {
      this.observations.clear();
      this.metricsCache.clear();
    }
  }
}
