import {
  CanonicalBar,
  ReferenceBar,
  DataGap,
  BackfillJob,
  BackfillConflictPolicy
} from "./types";

export interface HistoricalProvider {
  name: string;
  fetchBars(symbol: string, startTs: number, endTs: number): Promise<ReferenceBar[] | CanonicalBar[]>;
}

export interface GapDetectionConfig {
  expectedIntervalMs: number;    // e.g. 60,000 for 1-minute bars
  toleranceMultiplier?: number;  // e.g. 1.5 -> gap if delta >= 90,000ms
  maxChunkSize?: number;         // Max bars requested per query chunk (e.g., 500)
}

export class MarketDataBackfillEngine {
  private jobs: Map<string, BackfillJob> = new Map();
  private gaps: Map<string, DataGap> = new Map();

  /**
   * Scans a sorted series of bars for temporal gaps.
   */
  public detectGaps(
    symbol: string,
    bars: CanonicalBar[],
    config: GapDetectionConfig
  ): DataGap[] {
    const detected: DataGap[] = [];
    const interval = config.expectedIntervalMs;
    const tolerance = config.toleranceMultiplier || 1.5;
    const gapThreshold = interval * tolerance;

    if (bars.length < 2) return detected;

    // Ensure sorted by timestamp
    const sorted = [...bars].sort((a, b) => a.timestamp - b.timestamp);

    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];
      const delta = curr.timestamp - prev.timestamp;

      if (delta >= gapThreshold) {
        const missingBarCount = Math.floor(delta / interval) - 1;
        const gapId = `GAP-${symbol}-${prev.timestamp}-${curr.timestamp}`;

        const gap: DataGap = {
          gapId,
          symbol,
          startTs: prev.timestamp + interval,
          endTs: curr.timestamp - interval,
          expectedIntervalMs: interval,
          missingBarCount: Math.max(1, missingBarCount),
          detectedAt: Date.now(),
          reason: "INTERVAL_SILENCE",
          status: "DETECTED"
        };

        detected.push(gap);
        this.gaps.set(gapId, gap);
      }
    }

    return detected;
  }

  /**
   * Creates a tracked backfill job partitioned into bounded chunks.
   */
  public createBackfillJob(
    symbol: string,
    startTs: number,
    endTs: number,
    resolutionMs = 60000,
    conflictPolicy: BackfillConflictPolicy = "GOLDEN_REFERENCE_OVERWRITE",
    maxChunkBars = 500
  ): BackfillJob {
    const totalDurationMs = Math.max(0, endTs - startTs);
    const estimatedBars = Math.ceil(totalDurationMs / resolutionMs) || 1;
    const totalChunks = Math.max(1, Math.ceil(estimatedBars / maxChunkBars));

    const jobId = `BFJ-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const job: BackfillJob = {
      jobId,
      symbol,
      startTs,
      endTs,
      resolutionMs,
      status: "PENDING",
      totalChunks,
      completedChunks: 0,
      barsRecovered: 0,
      conflictPolicy,
      createdAt: Date.now(),
      errors: []
    };

    this.jobs.set(jobId, job);
    return job;
  }

  /**
   * Executes backfill merging fetched historical bars into existing series
   * applying the configured conflict resolution policy.
   */
  public mergeBackfilledBars(
    existingBars: CanonicalBar[],
    backfilledBars: (CanonicalBar | ReferenceBar)[],
    conflictPolicy: BackfillConflictPolicy = "GOLDEN_REFERENCE_OVERWRITE"
  ): CanonicalBar[] {
    const barMap = new Map<number, CanonicalBar>();

    for (const b of existingBars) {
      barMap.set(b.timestamp, { ...b });
    }

    for (const raw of backfilledBars) {
      const ts = raw.timestamp;
      const normalized: CanonicalBar = {
        symbol: raw.symbol,
        timestamp: raw.timestamp,
        open: raw.open,
        high: raw.high,
        low: raw.low,
        close: raw.close,
        volume: raw.volume,
        vwap: raw.vwap,
        source: raw.source || "HISTORICAL_BACKFILL"
      };

      const existing = barMap.get(ts);

      if (!existing) {
        // Gap fill: brand new bar
        barMap.set(ts, normalized);
      } else {
        // Conflict resolution
        switch (conflictPolicy) {
          case "GOLDEN_REFERENCE_OVERWRITE":
            barMap.set(ts, normalized);
            break;
          case "PRESERVE_EXISTING":
            // Keep existing unmodified
            break;
          case "MAX_VOLUME_MERGE":
            barMap.set(ts, {
              ...existing,
              high: Math.max(existing.high, normalized.high),
              low: Math.min(existing.low, normalized.low),
              close: normalized.close, // Prefer backfilled clean close
              volume: Math.max(existing.volume, normalized.volume)
            });
            break;
        }
      }
    }

    // Return sorted array
    return Array.from(barMap.values()).sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Simulates/orchestrates the backfill fetch across providers with priority fallback.
   */
  public async executeBackfill(
    jobId: string,
    existingSeries: CanonicalBar[],
    providers: HistoricalProvider[]
  ): Promise<{ updatedSeries: CanonicalBar[]; job: BackfillJob }> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Backfill job not found: ${jobId}`);
    }

    job.status = "RUNNING";
    let recoveredBars: (CanonicalBar | ReferenceBar)[] = [];

    for (const provider of providers) {
      try {
        const fetched = await provider.fetchBars(job.symbol, job.startTs, job.endTs);
        if (fetched && fetched.length > 0) {
          recoveredBars = fetched;
          job.completedChunks = job.totalChunks;
          job.barsRecovered = fetched.length;
          break; // Primary or first responding provider satisfied the request
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        job.errors.push(`Provider ${provider.name} failed: ${errMsg}`);
      }
    }

    if (recoveredBars.length > 0) {
      const merged = this.mergeBackfilledBars(existingSeries, recoveredBars, job.conflictPolicy);
      job.status = "COMPLETED";
      job.completedAt = Date.now();
      return { updatedSeries: merged, job };
    } else {
      job.status = job.errors.length > 0 ? "FAILED" : "PARTIAL";
      job.completedAt = Date.now();
      return { updatedSeries: existingSeries, job };
    }
  }

  public getJob(jobId: string): BackfillJob | undefined {
    return this.jobs.get(jobId);
  }

  public getAllJobs(): BackfillJob[] {
    return Array.from(this.jobs.values());
  }

  public getGaps(symbol?: string): DataGap[] {
    const all = Array.from(this.gaps.values());
    if (!symbol) return all;
    return all.filter((g) => g.symbol.toUpperCase() === symbol.toUpperCase());
  }
}
