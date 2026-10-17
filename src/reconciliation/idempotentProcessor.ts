import crypto from "crypto";
import { IdempotencyReceipt } from "./types";

export interface IdempotentProcessorOptions {
  ttlMs?: number;        // Deduplication time-to-live in ms (default: 24 hours)
  maxCapacity?: number;  // Max records cached (default: 100,000)
}

export class IdempotentReconciliationProcessor {
  private readonly ttlMs: number;
  private readonly maxCapacity: number;
  private processedMap: Map<string, IdempotencyReceipt> = new Map();

  constructor(options: IdempotentProcessorOptions = {}) {
    this.ttlMs = options.ttlMs || 86400000; // 24 hours
    this.maxCapacity = options.maxCapacity || 100000;
  }

  /**
   * Generates a deterministic SHA-256 fingerprint for any market data record.
   */
  public generateFingerprint(data: unknown): string {
    const serialized = typeof data === "object" && data !== null
      ? JSON.stringify(data, Object.keys(data).sort())
      : String(data);

    return crypto.createHash("sha256").update(serialized).digest("hex");
  }

  /**
   * Generates a composite idempotency key based on symbol, timestamp, and operation.
   */
  public generateIdempotencyKey(symbol: string, timestamp: number, operation = "RECONCILE"): string {
    return `${operation}:${symbol.toUpperCase()}:${timestamp}`;
  }

  /**
   * Evaluates if a given payload or idempotency key has already been processed.
   * If already processed and !forceReplay, returns the cached receipt.
   * If new, executes the operation and records the receipt atomically.
   */
  public execute<TInput, TOutput>(
    key: string,
    inputPayload: TInput,
    handler: (payload: TInput) => TOutput,
    forceReplay = false
  ): IdempotencyReceipt<TOutput> {
    const now = Date.now();
    const contentHash = this.generateFingerprint(inputPayload);
    const existing = this.processedMap.get(key);

    if (existing && !forceReplay) {
      // Check if within TTL
      if (now - existing.firstSeenAt < this.ttlMs) {
        return {
          idempotencyKey: key,
          contentHash,
          processedAt: existing.processedAt,
          firstSeenAt: existing.firstSeenAt,
          isDuplicate: true,
          resultPayload: existing.resultPayload as TOutput
        };
      }
    }

    // Process fresh record or forced replay
    const result = handler(inputPayload);
    const receipt: IdempotencyReceipt<TOutput> = {
      idempotencyKey: key,
      contentHash,
      processedAt: now,
      firstSeenAt: existing ? existing.firstSeenAt : now,
      isDuplicate: false,
      resultPayload: result
    };

    // Capacity eviction if reached limit
    if (this.processedMap.size >= this.maxCapacity) {
      const oldestKey = this.processedMap.keys().next().value;
      if (oldestKey) this.processedMap.delete(oldestKey);
    }

    this.processedMap.set(key, receipt as IdempotencyReceipt<unknown>);
    return receipt;
  }

  public hasBeenProcessed(key: string): boolean {
    const rec = this.processedMap.get(key);
    if (!rec) return false;
    return Date.now() - rec.firstSeenAt < this.ttlMs;
  }

  public getReceipt(key: string): IdempotencyReceipt | undefined {
    return this.processedMap.get(key);
  }

  public clear(): void {
    this.processedMap.clear();
  }

  public size(): number {
    return this.processedMap.size;
  }
}
